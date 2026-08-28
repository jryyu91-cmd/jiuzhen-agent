"""酒阵 Agent · 品牌事实与酒类营销合规检查（MVP 规则版）"""
from .models import ComplianceIssue, ComplianceReport, DistilleryInfo, GeneratedContent

# MVP 只做高风险表达提示，不替代企业法务审核。
_RULES = [
    ("high", ["干杯", "一饮而尽", "喝三杯", "多喝", "豪饮"], "避免诱导、鼓励或强化饮酒动作", "改成餐桌、人物交流或产品静物场景，不展示鼓励饮酒的动作。"),
    ("high", ["解压", "消愁", "治愈焦虑", "缓解焦虑", "去火气", "忘掉烦恼"], "不得暗示饮酒具有消除紧张、焦虑等功能", "把情绪表达改为场景氛围，不把情绪改善归因于饮酒。"),
    ("medium", ["最好", "第一", "顶级", "百分百", "绝对", "唯一"], "避免无法证实的绝对化或比较性表述", "使用可核验的具体事实替代绝对化形容词。"),
]


def review_content(info: DistilleryInfo, contents: list[GeneratedContent]) -> ComplianceReport:
    issues: list[ComplianceIssue] = []
    joined = "\n".join(c.body for c in contents)
    for level, words, rule, suggestion in _RULES:
        for word in words:
            if word in joined:
                issues.append(ComplianceIssue(level=level, rule=rule, excerpt=word, suggestion=suggestion))

    verified_values = {f.value for f in info.fact_evidence}
    fact_gaps: list[str] = []
    for point in info.selling_points:
        if not any(point in value or value in point for value in verified_values):
            fact_gaps.append(f"卖点「{point}」尚未绑定证据来源")

    if not info.fact_evidence:
        fact_gaps.append("当前没有品牌事实证据；正式发布前建议补充工艺、产区、规格、资质等可核验资料。")

    return ComplianceReport(
        passed=not any(i.level == "high" for i in issues) and not fact_gaps,
        issues=issues,
        fact_gaps=fact_gaps,
    )
