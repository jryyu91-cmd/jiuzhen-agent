"""酿见 AI · 企业资料理解层。

核心原则：
1. 企业先交已有资料，不要求先整理成营销表单；
2. 只抽取资料中能找到依据的事实；
3. 能用 LLM 时做语义抽取，未配置时使用可解释规则兜底；
4. 营销推断和事实抽取分开，避免把“建议”误当成“事实”。
"""
from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request
from typing import Any

from .models import FactEvidence, MaterialAnalysis, MaterialProfileDraft, SourceMaterial

_PROCESS_TERMS = [
    "大曲坤沙", "坤沙", "碎沙", "翻沙", "酱香型", "浓香型", "清香型",
    "老酒勾调", "陶坛储存", "陶坛储藏", "小坛储存", "固态发酵", "纯粮酿造",
]
_LOCATION_TERMS = [
    "贵州遵义·茅台镇", "贵州遵义·习水县", "贵州遵义", "茅台镇", "习水县", "仁怀市", "贵州",
]


def _excerpt(text: str, start: int, end: int, radius: int = 34) -> str:
    left = max(0, start - radius)
    right = min(len(text), end + radius)
    return re.sub(r"\s+", " ", text[left:right]).strip()


def _add_fact(facts: list[FactEvidence], label: str, value: str, source: SourceMaterial, excerpt: str) -> None:
    key = (label.strip(), value.strip())
    if not value.strip() or any((f.label, f.value) == key for f in facts):
        return
    facts.append(FactEvidence(
        label=label.strip(),
        value=value.strip(),
        source=source.name,
        source_excerpt=excerpt.strip(),
        confidence="confirmed",
    ))


def _first_match(materials: list[SourceMaterial], pattern: str, flags: int = 0):
    regex = re.compile(pattern, flags)
    for material in materials:
        match = regex.search(material.text)
        if match:
            return material, match
    return None, None


def _rule_extract(materials: list[SourceMaterial]) -> MaterialProfileDraft:
    facts: list[FactEvidence] = []
    selling_points: list[str] = []
    name = ""
    product_name = ""
    price_range = ""
    location = ""

    # 优先识别明确标注字段，避免仅凭一句营销语猜品牌名/产品名。
    field_patterns = {
        "name": r"(?:酒厂|品牌(?:名称)?|企业(?:名称)?)\s*[：:]\s*([^\n，,；;]{2,30})",
        "product_name": r"(?:产品(?:名称)?|品名)\s*[：:]\s*([^\n，,；;]{2,40})",
    }
    material, match = _first_match(materials, field_patterns["name"])
    if material and match:
        name = match.group(1).strip()
    material, match = _first_match(materials, field_patterns["product_name"])
    if material and match:
        product_name = match.group(1).strip()

    for material in materials:
        text = material.text

        for match in re.finditer(r"(?<!\d)(\d{2,4})\s*元(?:/瓶|/盒)?", text):
            value = f"{match.group(1)}元"
            if not price_range:
                price_range = value
            _add_fact(facts, "价格", value, material, _excerpt(text, *match.span()))

        for match in re.finditer(r"(?<!\d)(\d{1,2}(?:\.\d+)?)\s*(?:%\s*vol|%vol|度)(?!\d)", text, flags=re.I):
            value = f"{match.group(1)}%vol"
            _add_fact(facts, "酒精度", value, material, _excerpt(text, *match.span()))
            if value not in selling_points:
                selling_points.append(value)

        for match in re.finditer(r"(?<!\d)(\d{2,4})\s*(?:ml|mL|毫升)", text):
            value = f"{match.group(1)}mL"
            _add_fact(facts, "规格", value, material, _excerpt(text, *match.span()))
            if value not in selling_points:
                selling_points.append(value)

        for term in _PROCESS_TERMS:
            idx = text.find(term)
            if idx >= 0:
                _add_fact(facts, "产品/工艺", term, material, _excerpt(text, idx, idx + len(term)))
                if term not in selling_points:
                    selling_points.append(term)

        for term in _LOCATION_TERMS:
            idx = text.find(term)
            if idx >= 0:
                if not location:
                    location = term
                _add_fact(facts, "产区/地址", term, material, _excerpt(text, idx, idx + len(term)))
                break

    # 没有显式“产品名称：”时，允许从“XX·XX / XX小坛”等高置信命名结构补一个候选，仍要求人工确认。
    if not product_name:
        for material in materials:
            candidates = re.findall(r"[\u4e00-\u9fa5A-Za-z0-9]{1,10}[·・][\u4e00-\u9fa5A-Za-z0-9]{1,12}", material.text)
            if candidates:
                product_name = candidates[0]
                break

    extra_material = ""
    for material in materials:
        lines = [re.sub(r"\s+", " ", line).strip() for line in material.text.splitlines()]
        scene_lines = [line for line in lines if any(k in line for k in ("朋友", "聚餐", "夜宵", "烧烤", "家常", "老师傅", "车间", "酒醅"))]
        if scene_lines:
            extra_material = "；".join(scene_lines[:3])[:300]
            break

    return MaterialProfileDraft(
        name=name,
        location=location,
        product_name=product_name,
        price_range=price_range,
        selling_points=selling_points[:8],
        fact_evidence=facts[:20],
        extra_material=extra_material,
    )


def _llm_enabled() -> bool:
    return bool(os.getenv("LLM_API_KEY") and os.getenv("LLM_MODEL"))


def _llm_extract(materials: list[SourceMaterial]) -> MaterialProfileDraft | None:
    """调用 OpenAI-compatible Chat Completions 接口做事实抽取。

    不绑定具体模型厂商。通过 LLM_BASE_URL / LLM_API_KEY / LLM_MODEL 配置。
    如果接口异常或 JSON 不合法，自动回退到规则抽取。
    """
    if not _llm_enabled():
        return None

    base = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    key = os.getenv("LLM_API_KEY", "")
    model = os.getenv("LLM_MODEL", "")
    material_text = "\n\n".join(
        f"=== SOURCE: {m.name} ===\n{m.text[:12000]}" for m in materials if m.text.strip()
    )[:30000]
    if not material_text:
        return None

    schema_hint = {
        "name": "资料明确支持的酒厂/品牌名称，否则空字符串",
        "location": "资料明确支持的产区/地址，否则空字符串",
        "product_name": "资料明确支持的产品名，否则空字符串",
        "price_range": "资料明确支持的价格，否则空字符串",
        "selling_points": ["只放资料明确出现的产品事实"],
        "facts": [{"label": "度数", "value": "42%vol", "source": "文件名", "excerpt": "原文片段"}],
        "extra_material": "资料中真实人物/车间/餐桌细节，没有则空",
    }
    system = (
        "你是白酒企业资料整理助手。你的任务只有事实抽取，不做营销推断。"
        "绝对不能根据常识补写工艺、产区、年份、荣誉、物流、渠道或消费者画像。"
        "每一条 facts 必须给出来源文件名与支持它的短原文。只返回 JSON。"
    )
    user = f"请从资料中抽取档案草稿，JSON 结构参考：{json.dumps(schema_hint, ensure_ascii=False)}\n\n资料：\n{material_text}"
    payload = json.dumps({
        "model": model,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{base}/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            raw = json.loads(response.read().decode("utf-8"))
        content = raw["choices"][0]["message"]["content"]
        data: dict[str, Any] = json.loads(content)
        source_names = {m.name for m in materials}
        facts: list[FactEvidence] = []
        for item in data.get("facts", [])[:20]:
            source = str(item.get("source", "")).strip()
            if source not in source_names:
                continue
            value = str(item.get("value", "")).strip()
            label = str(item.get("label", "事实")).strip()
            excerpt = str(item.get("excerpt", "")).strip()
            if value and excerpt:
                facts.append(FactEvidence(
                    label=label,
                    value=value,
                    source=source,
                    source_excerpt=excerpt[:180],
                    confidence="confirmed",
                ))
        return MaterialProfileDraft(
            name=str(data.get("name", "")).strip(),
            location=str(data.get("location", "")).strip(),
            product_name=str(data.get("product_name", "")).strip(),
            price_range=str(data.get("price_range", "")).strip(),
            selling_points=[str(x).strip() for x in data.get("selling_points", []) if str(x).strip()][:8],
            fact_evidence=facts,
            extra_material=str(data.get("extra_material", "")).strip()[:300],
        )
    except (urllib.error.URLError, TimeoutError, KeyError, ValueError, json.JSONDecodeError):
        return None


def analyze_materials(materials: list[SourceMaterial]) -> tuple[MaterialAnalysis, MaterialProfileDraft]:
    clean = [m for m in materials if m.text.strip()]
    llm_draft = _llm_extract(clean)
    draft = llm_draft or _rule_extract(clean)
    mode = "llm" if llm_draft is not None else "rules"

    missing: list[str] = []
    if not draft.product_name:
        missing.append("产品名称")
    if not draft.price_range:
        missing.append("价格")
    if not draft.location:
        missing.append("产区/地址")
    if not draft.fact_evidence:
        missing.append("可追溯产品事实")

    notes = [
        "资料只负责提取事实；人群、场景和营销建议会在下一层单独推断。",
        "所有自动识别结果都建议由企业人员确认后再成为长期品牌资产。",
    ]
    if not clean:
        notes.insert(0, "当前没有可解析资料，可继续手动填写。")

    return MaterialAnalysis(
        source_names=[m.name for m in clean],
        extracted_facts=draft.fact_evidence,
        missing_fields=missing,
        notes=notes,
        mode=mode,
    ), draft


def merge_material_draft(info, analysis: MaterialAnalysis, draft: MaterialProfileDraft):
    """资料抽取只补空缺，不覆盖企业已经人工确认的字段。"""
    existing_fact_keys = {(f.label, f.value, f.source) for f in info.fact_evidence}
    merged_facts = list(info.fact_evidence)
    for fact in draft.fact_evidence:
        if (fact.label, fact.value, fact.source) not in existing_fact_keys:
            merged_facts.append(fact)

    selling_points = list(info.selling_points)
    for point in draft.selling_points:
        if point not in selling_points:
            selling_points.append(point)

    return info.model_copy(update={
        "name": info.name or draft.name,
        "location": info.location or draft.location,
        "product_name": info.product_name or draft.product_name,
        "price_range": info.price_range or draft.price_range,
        "selling_points": selling_points,
        "fact_evidence": merged_facts,
        "extra_material": info.extra_material or draft.extra_material,
    })
