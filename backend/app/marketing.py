"""酒阵 Agent · 营销诊断层

目标不是让用户先懂营销再填表，而是根据产品底层信息，先给出可执行的人群、场景与渠道建议。
这是规则版 MVP；后续可替换为 LLM + 行业知识库 + 历史经营数据。
"""
from .models import AudienceSegment, DistilleryInfo, MarketingDiagnosis, SceneOpportunity


def _price_bucket(price: str) -> str:
    digits = "".join(ch for ch in price if ch.isdigit())
    try:
        value = int(digits[:4]) if digits else 0
    except ValueError:
        value = 0
    if value and value <= 200:
        return "daily"
    if value and value <= 500:
        return "mid"
    return "premium"


def diagnose_marketing(info: DistilleryInfo) -> MarketingDiagnosis:
    bucket = _price_bucket(info.price_range)

    if bucket == "daily":
        audiences = [
            AudienceSegment(
                name="25-35岁成年朋友小聚人群",
                need="聚会有酒但不想有强商务感，预算可控、容易分享",
                trigger="周末聚餐、烧烤、火锅、夜宵",
                recommended_scene="朋友小聚/佐餐",
                priority="高",
            ),
            AudienceSegment(
                name="日常自饮人群",
                need="在家吃饭或休息时少量饮用，重视性价比与稳定口感",
                trigger="晚餐、周末做饭、独处休息",
                recommended_scene="居家佐餐",
                priority="高",
            ),
        ]
        scenes = [
            SceneOpportunity("朋友小聚", "低门槛价位更适合从应酬转向轻社交", "一顿普通饭为什么也值得有一瓶酒", "引导到店/私信咨询规格"),
            SceneOpportunity("居家佐餐", "降低‘必须有酒局才喝酒’的仪式门槛", "家常菜、周末做饭、老友上门", "推荐小规格/试饮装/组合装"),
        ]
    elif bucket == "mid":
        audiences = [
            AudienceSegment("30-45岁品质自饮人群", "希望喝得明白、品质稳定，不愿为过度包装买单", "周末聚餐、家庭宴、朋友来访", "品质自饮", "高"),
            AudienceSegment("熟人礼赠人群", "需要体面但不想只买全国名酒", "节日拜访、朋友往来、地方伴手礼", "轻礼赠", "中"),
        ]
        scenes = [
            SceneOpportunity("家庭聚餐", "中价位能兼顾品质感和日常可负担性", "一道菜+一瓶酒的具体搭配", "引导咨询口感/规格"),
            SceneOpportunity("老友来访", "比正式宴请轻，又保留白酒的分享属性", "朋友之间不用劝酒的轻松叙事", "引导收藏/私信"),
        ]
    else:
        audiences = [
            AudienceSegment("品质收藏与鉴赏型成年消费者", "关注品牌可信度、稀缺性与产品证据", "重要聚会、纪念日、深度品鉴", "品质鉴赏", "高"),
            AudienceSegment("高品质礼赠人群", "需要品牌故事、包装与可信背书", "重要节庆、商务往来、纪念礼赠", "高端礼赠", "中"),
        ]
        scenes = [
            SceneOpportunity("深度品鉴", "高价产品必须让消费者理解价值从哪里来", "工艺证据、批次、人物、产地细节", "预约品鉴/咨询资料"),
            SceneOpportunity("重要礼赠", "高价产品更依赖信任资产而非单次促销", "礼赠对象、品牌出处、产品证据", "咨询礼盒与服务"),
        ]

    # 用户已明确人群/场景时，保留其业务判断并提高优先级，而不是强行覆盖。
    if info.target_audience.strip():
        audiences.insert(0, AudienceSegment(
            name=info.target_audience.strip(),
            need="企业已明确的核心客群，建议优先用真实销售数据继续细分",
            trigger=info.consume_scene or "待结合历史成交场景补充",
            recommended_scene=info.consume_scene or "待验证",
            priority="最高（企业输入）",
        ))
    if info.consume_scene:
        scenes.insert(0, SceneOpportunity(
            scene=info.consume_scene,
            why_fit="企业已明确的真实消费场景，应优先验证内容与成交表现",
            content_angle="围绕真实人物、真实时间、真实餐桌细节展开",
            conversion_action="记录咨询量、成交量与复购反馈",
        ))

    channels = [
        "朋友圈/私域：承接熟人信任、活动与咨询",
        "短视频：用人物、餐桌、产地真实画面做场景种草",
        "公众号：沉淀品牌事实、工艺证据与长期可搜索内容",
    ]
    if "小红书" in info.existing_channels:
        channels.append("小红书：避免硬广，优先做成年消费者的餐饮搭配、地方体验和生活场景")

    return MarketingDiagnosis(
        core_problem="不是缺一篇文案，而是需要把产品从单一宴饮逻辑拆成可持续经营的消费者场景。",
        strategy="先确定优先人群和场景，再决定内容，不让企业先回答一堆它本来就不会的营销问题。",
        audience_segments=audiences[:3],
        scene_opportunities=scenes[:3],
        channel_plan=channels,
        next_action="先选 1 个高优先级人群 × 1 个生活场景连续测试 2 周，再根据咨询和成交反馈调整。",
    )
