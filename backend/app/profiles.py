"""酿见 AI · 一厂一档品牌档案库（演示数据）"""
from .models import BrandProfile, FactEvidence, SourceMaterial

_DEMO_PROFILES: dict[str, BrandProfile] = {
    "laoshaofang": BrandProfile(
        profile_id="laoshaofang",
        distillery_name="茅台镇老烧坊",
        positioning="茅台镇 388 元的实在酱酒，把产区的底气讲成人话",
        lifestyle_scene="周末炖菜、老友上门",
        location="贵州遵义·茅台镇",
        product_name="老烧坊·窖藏10",
        price_range="388元",
        target_audience="30-45岁品质自饮与熟人聚餐人群",
        selling_points=["大曲坤沙", "老酒勾调", "赤水河谷产区"],
        brand_tone="朴实、可信、有生活感",
        tone_taboos=["不得意腔", "不吹年份", "不用绝对化词汇"],
        topic_preferences=["酿造工艺", "老师傅故事", "产区风物", "家庭聚餐"],
        scene_materials=[
            "演示素材：酒师傅凌晨四点查看酒醅",
            "演示素材：曲仓温度记录与人工巡检",
        ],
        fact_evidence=[
            FactEvidence(label="工艺", value="大曲坤沙", source="演示档案"),
            FactEvidence(label="产品", value="老酒勾调", source="演示档案"),
            FactEvidence(label="产区", value="赤水河谷产区", source="演示档案"),
        ],
    ),
    "qingxi": BrandProfile(
        profile_id="qingxi",
        distillery_name="青溪酒厂",
        positioning="168 元小坛酒，从朋友小聚和日常佐餐切入",
        lifestyle_scene="烧烤夜宵、朋友小聚、日常佐餐",
        location="贵州遵义·习水县",
        product_name="青溪·小坛",
        price_range="168元",
        target_audience="25-35岁成年朋友小聚与日常佐餐人群",
        selling_points=["小坛储存", "42%vol", "小规格"],
        brand_tone="轻松、实在、像会喝酒的朋友在聊天",
        tone_taboos=["不摆大师腔", "不讲玄学", "不用『尊贵』类词汇"],
        topic_preferences=["朋友小聚", "佐餐搭配", "夜宵场景"],
        scene_materials=[
            "演示素材：周五夜宵摊的朋友聚餐场景",
            "演示素材：酒厂周边的本地餐饮场景",
        ],
        fact_evidence=[
            FactEvidence(label="储存", value="小坛储存", source="演示档案"),
            FactEvidence(label="酒精度", value="42%vol", source="演示档案"),
            FactEvidence(label="规格", value="小规格", source="演示档案"),
        ],
    ),
}


_DEMO_SOURCE_MATERIALS: dict[str, list[SourceMaterial]] = {
    "laoshaofang": [
        SourceMaterial(
            name="产品资料-demo.txt",
            source_kind="demo",
            text="""酒厂：茅台镇老烧坊
产品名称：老烧坊·窖藏10
建议零售价：388元
产区：贵州遵义·茅台镇
产品资料中记录：大曲坤沙、老酒勾调。
说明：以上均为比赛演示资料，不代表真实企业经营事实。""",
        ),
        SourceMaterial(
            name="市场素材-demo.txt",
            source_kind="demo",
            text="""演示素材：周末在家炖菜，老朋友上门吃饭。
演示素材：酒师傅凌晨四点查看酒醅，曲仓有人工巡检记录。
这些内容仅用于演示资料理解与场景生成。""",
        ),
    ],
    "qingxi": [
        SourceMaterial(
            name="产品手册-demo.txt",
            source_kind="demo",
            text="""酒厂：青溪酒厂
产品名称：青溪·小坛
建议零售价：168元
产区：贵州遵义·习水县
瓶身标注酒精度：42%vol
产品资料：小坛储存，小规格包装。
说明：以上均为比赛演示资料，不代表真实企业经营事实。""",
        ),
        SourceMaterial(
            name="历史内容-demo.txt",
            source_kind="demo",
            text="""过去拍过周五夜宵摊的朋友聚餐，也拍过酒厂周边的本地餐饮。
烧烤刚上桌，几位成年朋友坐下来聊天，产品以静物方式出现在餐桌边。
希望品牌表达轻松、实在，不摆大师腔。""",
        ),
    ],
}


def get_profile(profile_id: str) -> BrandProfile | None:
    return _DEMO_PROFILES.get(profile_id)


def list_profiles() -> list[BrandProfile]:
    return list(_DEMO_PROFILES.values())


def profile_to_info(p: BrandProfile):
    from .models import DistilleryInfo
    return DistilleryInfo(
        name=p.distillery_name,
        location=p.location,
        product_name=p.product_name,
        price_range=p.price_range,
        target_audience=p.target_audience,
        selling_points=p.selling_points,
        consume_scene=p.lifestyle_scene or None,
        marketing_goal="消费者动销",
        existing_channels=["朋友圈", "短视频", "公众号"],
        brand_tone=p.brand_tone,
        tone_taboos=list(p.tone_taboos),
        fact_evidence=list(p.fact_evidence),
        extra_material="；".join(p.scene_materials) if p.scene_materials else None,
        source_materials=list(_DEMO_SOURCE_MATERIALS.get(p.profile_id, [])),
    )
