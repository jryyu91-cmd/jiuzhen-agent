"""酿见 AI · 营销诊断层。

资料层只回答“企业资料里有什么事实”；营销层才回答“基于这些事实，下一步应该测试谁、什么场景”。
配置 LLM_BASE_URL / LLM_API_KEY / LLM_MODEL 时使用大模型做受证据约束的营销推理；
未配置或调用失败时，回退到可解释规则，保证 Demo 和企业现场可继续工作。
"""
from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request

from .models import AudienceSegment, DistilleryInfo, MarketingDiagnosis, SceneOpportunity


def _price_value(price: str) -> int:
    digits = re.findall(r"\d{2,4}", price or "")
    return int(digits[0]) if digits else 0


def _price_bucket(price: str) -> str:
    value = _price_value(price)
    if not value:
        return "unknown"
    if value <= 200:
        return "daily"
    if value <= 500:
        return "mid"
    return "premium"


def _confirmed_fact_values(info: DistilleryInfo) -> list[str]:
    values: list[str] = []
    for fact in info.fact_evidence:
        if fact.value and fact.value not in values:
            values.append(fact.value)
    return values


def _low_degree(info: DistilleryInfo) -> bool:
    for value in _confirmed_fact_values(info) + info.selling_points:
        match = re.search(r"(\d{1,2}(?:\.\d+)?)\s*(?:%vol|度)", value, flags=re.I)
        if match and float(match.group(1)) <= 43:
            return True
    return False


def _small_format(info: DistilleryInfo) -> bool:
    text = " ".join(_confirmed_fact_values(info) + info.selling_points)
    if any(word in text for word in ("小规格", "小瓶", "小坛", "100mL", "125mL", "200mL", "250mL")):
        return True
    match = re.search(r"(\d{2,4})\s*m[lL]", text)
    return bool(match and int(match.group(1)) <= 250)


def _channel_plan(info: DistilleryInfo) -> list[str]:
    available = info.existing_channels or ["朋友圈", "短视频", "公众号"]
    templates = {
        "朋友圈": "朋友圈/私域：承接熟人信任、活动反馈与咨询",
        "短视频": "短视频：用人物、餐桌、产地和产品静物建立场景认知",
        "公众号": "公众号：沉淀品牌事实、产品证据和可长期复用内容",
        "小红书": "小红书：优先做成年消费者的餐饮搭配、地方体验和生活场景，不做硬广堆卖点",
    }
    return [templates[channel] for channel in available if channel in templates]


def _next_action(goal: str) -> str:
    return {
        "消费者动销": "先选 1 个高优先级人群 × 1 个生活场景连续测试 2 周，记录咨询、到店/下单和复购反馈，再决定是否放大。",
        "新品种草": "先用 1 个核心场景做 3 种内容表达，连续测试 7 天，比较收藏、私信和询价，再确定新品主叙事。",
        "品牌认知": "先固定 1 个品牌场景和 2-3 条可追溯事实，连续输出一组内容，让消费者形成稳定的“什么时候想到这瓶酒”认知。",
        "私域转化": "先整理私域里最常见的 3 类问题和 1 个高频购买场景，用事实证据统一回复，再记录咨询到成交的转化。",
    }.get(goal, "先选 1 个高优先级人群 × 1 个场景做小范围测试，用真实反馈决定下一轮。")


def _try_llm_diagnose(info: DistilleryInfo) -> MarketingDiagnosis | None:
    base = os.getenv("LLM_BASE_URL", "").rstrip("/")
    key = os.getenv("LLM_API_KEY", "")
    model = os.getenv("LLM_MODEL", "")
    if not (base and key and model):
        return None

    facts = [
        {"label": f.label, "value": f.value, "source": f.source}
        for f in info.fact_evidence[:20]
        if f.value
    ]
    context = {
        "brand": info.name,
        "product": info.product_name,
        "price": info.price_range,
        "location": info.location,
        "confirmed_facts": facts,
        "confirmed_selling_points": info.selling_points,
        "known_audience": info.target_audience,
        "known_scene": info.consume_scene or "",
        "marketing_goal": info.marketing_goal,
        "existing_channels": info.existing_channels,
    }
    system = (
        "你是服务中国中小白酒企业的营销诊断 Agent。只基于给定企业事实与明确输入做推理。"
        "事实和建议必须分开：不得把行业常识写成该企业事实，不得编造销量、渠道、奖项、工艺、用户评价。"
        "所有建议对象必须是成年消费者，不针对未成年人；不鼓励过量饮酒，不将饮酒与解压、治愈、功能效果绑定。"
        "如果价格、规格、渠道等关键资料缺失，要降低结论确定性并明确待确认项。"
        "输出一个可小范围验证的策略，不要给宏大空话。只返回 JSON。"
    )
    shape = {
        "core_problem": "一句具体问题",
        "strategy": "一句主策略",
        "audience_segments": [{"name": "成年客群", "need": "需求", "trigger": "触发时机", "recommended_scene": "场景", "priority": "高/中"}],
        "scene_opportunities": [{"scene": "场景", "why_fit": "为什么适合，明确是推断不是事实", "content_angle": "内容角度", "conversion_action": "怎么测试/承接"}],
        "channel_plan": ["渠道：动作"],
        "next_action": "未来7-14天第一步",
        "reasoning_basis": ["价格168元", "42%vol（来源：产品手册）"],
    }
    user = f"业务上下文：{json.dumps(context, ensure_ascii=False)}\n\n请按这个 JSON 结构输出：{json.dumps(shape, ensure_ascii=False)}"
    payload = json.dumps({
        "model": model,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        "temperature": 0.2,
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{base}/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            raw = json.loads(response.read().decode("utf-8"))
        content = str(raw["choices"][0]["message"]["content"]).strip()
        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?\s*|\s*```$", "", content, flags=re.I | re.S)
        data = json.loads(content)
        data["reasoning_mode"] = "llm"
        data.setdefault("reasoning_basis", [])
        diagnosis = MarketingDiagnosis.model_validate(data)
        if not diagnosis.audience_segments or not diagnosis.scene_opportunities:
            return None
        return diagnosis
    except (urllib.error.URLError, TimeoutError, KeyError, ValueError, json.JSONDecodeError):
        return None


def _rule_diagnose(info: DistilleryInfo) -> MarketingDiagnosis:
    bucket = _price_bucket(info.price_range)
    low_degree = _low_degree(info)
    small_format = _small_format(info)

    if bucket == "unknown":
        audiences = [
            AudienceSegment(
                name="待验证的成年朋友聚餐人群",
                need="先验证产品在真实熟人聚餐中的接受度，不在关键价格信息缺失时给出过度细分结论",
                trigger="朋友聚餐、家庭来客",
                recommended_scene="熟人聚餐测试",
                priority="待验证",
            ),
            AudienceSegment(
                name="企业已有成交客群",
                need="优先从过去真实购买者和咨询者里找线索，而不是让 AI 凭空定义消费者",
                trigger="历史成交、咨询、门店反馈",
                recommended_scene="回看真实成交场景",
                priority="高（需企业补数据）",
            ),
        ]
        scenes = [
            SceneOpportunity(
                scene="真实成交场景回看",
                why_fit="价格等关键资料仍缺失，先从企业真实成交和咨询记录找场景比武断推荐更可靠",
                content_angle="整理过去谁来问、为什么买、在哪种场合使用",
                conversion_action="先补价格和3-5条历史咨询/成交记录，再进入下一轮诊断",
            ),
            SceneOpportunity(
                scene="熟人聚餐小测试",
                why_fit="作为低成本探索场景使用，不把它当成已经验证的品牌定位",
                content_angle="用真实餐桌与已确认产品事实做一条内容",
                conversion_action="记录询价、私信和到店反馈，7天后复盘",
            ),
        ]
    elif bucket == "daily":
        audiences = [
            AudienceSegment(
                name="25-35岁成年朋友小聚人群",
                need="聚会有酒但不想有强商务感，预算可控、选择容易理解",
                trigger="周末聚餐、烧烤、火锅、夜宵",
                recommended_scene="朋友小聚/佐餐",
                priority="高",
            ),
            AudienceSegment(
                name="日常佐餐型成年消费者",
                need="更看重适配餐桌、价格负担和产品信息是否清楚",
                trigger="家庭晚餐、周末做饭、朋友到家",
                recommended_scene="居家佐餐",
                priority="高" if (low_degree or small_format) else "中",
            ),
        ]
        scene_reason = "价格门槛较低"
        if low_degree:
            scene_reason += "，且已确认度数更适合做轻量场景测试"
        if small_format:
            scene_reason += "，小规格也降低了首次尝试门槛"
        scenes = [
            SceneOpportunity(
                scene="朋友小聚",
                why_fit=f"{scene_reason}，可以优先验证非商务聚餐",
                content_angle="朋友、菜、时间点先出现，产品作为场景的一部分",
                conversion_action="用现有私域/门店记录询价和成交",
            ),
            SceneOpportunity(
                scene="居家佐餐",
                why_fit="适合测试从正式宴饮向家庭餐桌延伸的可能性",
                content_angle="家常菜、周末做饭、老友上门",
                conversion_action="先做小范围内容测试，不在没有渠道资料时承诺购买方式",
            ),
        ]
    elif bucket == "mid":
        audiences = [
            AudienceSegment(
                name="30-45岁品质自用型成年消费者",
                need="希望产品信息清楚、品质稳定，不愿为过度包装买单",
                trigger="周末聚餐、家庭宴、朋友来访",
                recommended_scene="品质自用/熟人聚餐",
                priority="高",
            ),
            AudienceSegment(
                name="熟人轻礼赠人群",
                need="需要体面、可信、信息讲得明白",
                trigger="节日拜访、朋友往来、地方伴手礼",
                recommended_scene="轻礼赠",
                priority="中",
            ),
        ]
        scenes = [
            SceneOpportunity(
                scene="家庭聚餐",
                why_fit="中价位可先验证品质感与日常可负担之间的平衡",
                content_angle="一顿家宴里的具体人物和菜",
                conversion_action="记录内容后的咨询与到店反馈",
            ),
            SceneOpportunity(
                scene="老友来访",
                why_fit="比正式宴请更轻，同时保留白酒在熟人关系中的分享属性",
                content_angle="朋友见面，不用强调劝酒和身份",
                conversion_action="引导了解产品资料/线下咨询",
            ),
        ]
    else:
        audiences = [
            AudienceSegment(
                name="品质鉴赏型成年消费者",
                need="关注品牌可信度、产品差异和事实证据",
                trigger="重要聚会、纪念日、深度品鉴",
                recommended_scene="品质鉴赏",
                priority="高",
            ),
            AudienceSegment(
                name="高品质礼赠人群",
                need="需要品牌出处、包装与可信背书",
                trigger="重要节庆、商务往来、纪念礼赠",
                recommended_scene="高端礼赠",
                priority="中",
            ),
        ]
        scenes = [
            SceneOpportunity(
                scene="深度品鉴",
                why_fit="高价产品需要先让消费者理解价值从哪里来",
                content_angle="工艺证据、批次、人物、产地细节",
                conversion_action="预约了解/品鉴；具体方式需企业渠道资料确认",
            ),
            SceneOpportunity(
                scene="重要礼赠",
                why_fit="高价产品更依赖信任资产而不是一次促销",
                content_angle="礼赠对象、品牌出处、产品证据",
                conversion_action="咨询礼盒与服务；没有企业资料时不承诺库存或物流",
            ),
        ]

    if info.target_audience.strip():
        audiences.insert(0, AudienceSegment(
            name=info.target_audience.strip(),
            need="企业已经明确的客群，建议用历史成交与咨询继续验证和细分",
            trigger=info.consume_scene or "待结合实际成交场景补充",
            recommended_scene=info.consume_scene or "待验证",
            priority="最高（企业输入）",
        ))
    if info.consume_scene:
        scenes.insert(0, SceneOpportunity(
            scene=info.consume_scene,
            why_fit="这是企业已经明确的场景，应优先验证真实内容表现与成交反馈",
            content_angle="围绕真实人物、真实时间、真实餐桌细节展开",
            conversion_action="记录咨询、成交与复购反馈，不用单次播放量替代经营结果",
        ))

    facts = _confirmed_fact_values(info)
    basis = []
    if info.price_range:
        basis.append(f"价格：{info.price_range}")
    else:
        basis.append("价格：待确认（因此当前建议降低确定性）")
    basis.extend(f"已确认事实：{fact}" for fact in facts[:4])
    basis.append(f"本次目标：{info.marketing_goal}")

    return MarketingDiagnosis(
        core_problem="不是先缺一篇文案，而是要把已经确认的产品事实转成一个可验证的人群 × 场景营销任务。",
        strategy="先用企业已有事实缩小判断范围，再选一个场景小范围测试；反馈回来后再调整，而不是一次性给品牌下永久结论。",
        audience_segments=audiences[:3],
        scene_opportunities=scenes[:3],
        channel_plan=_channel_plan(info),
        next_action=_next_action(info.marketing_goal),
        reasoning_mode="rules",
        reasoning_basis=basis,
    )


def diagnose_marketing(info: DistilleryInfo) -> MarketingDiagnosis:
    return _try_llm_diagnose(info) or _rule_diagnose(info)
