"""酒阵 Agent · 一厂一档品牌档案库（个性化定制机制）

机制说明（演示讲解用）：
- 灵感来源：烽火AI「一客一工作区」矩阵运营 + 领航知识库「先装配上下文再创作」
- 每家酒厂建档一次（品牌语气红线、选题倾向、场景素材库），生成时按档案装配
- 档案即提示词工程：同一瓶酒，不同档案生成的内容风格完全不同
- 48h 演示版用内存存储；正式版换 SQLite/飞书多维表格，机制不变
"""
from .models import BrandProfile

# 内置两条演示档案：同一价位带，风格差异一眼可见
_DEMO_PROFILES: dict[str, BrandProfile] = {
    "laoshaofang": BrandProfile(
        profile_id="laoshaofang",
        distillery_name="茅台镇老烧坊",
        location="贵州遵义·茅台镇",
        product_name="老烧坊·窖藏10",
        price_range="388元",
        target_audience="30-45岁男性、商务送礼与自饮兼顾",
        selling_points=["大曲坤沙", "老酒勾调", "赤水河谷产区"],
        brand_tone="朴实、产区自豪感、有匠心但不装",
        tone_taboos=["不得意腔", "不吹年份", "禁『赶快下单』类催促"],
        topic_preferences=["酿造工艺", "老师傅故事", "产区风物"],
        scene_materials=[
            "酒师傅凌晨四点看酒醅，说这时候的酸香最骗不了人",
            "曲仓里温度计挂了一排，但老师傅还是先用手背贴",
        ],
    ),
    "qingxi": BrandProfile(
        profile_id="qingxi",
        distillery_name="青溪酒厂",
        location="贵州遵义·习水县",
        product_name="青溪·小坛",
        price_range="168元",
        target_audience="25-35岁年轻人、朋友小聚、佐餐日常",
        selling_points=["小坛储存", "42度柔和", "开坛即饮不用醒"],
        brand_tone="轻松、实在、像会喝酒的朋友在聊天",
        tone_taboos=["不摆大师腔", "不讲玄学", "禁『尊贵』类词汇"],
        topic_preferences=["年轻人酒桌", "佐餐搭配", "小聚场景"],
        scene_materials=[
            "周五晚上，镇上烧烤摊一半的桌子上摆的是青溪小坛",
            "酒厂门口就是青溪河，工人们下班顺手拎一坛回家",
        ],
    ),
}


def get_profile(profile_id: str) -> BrandProfile | None:
    return _DEMO_PROFILES.get(profile_id)


def list_profiles() -> list[dict]:
    return [
        {"profile_id": p.profile_id, "distillery_name": p.distillery_name,
         "product_name": p.product_name, "price_range": p.price_range}
        for p in _DEMO_PROFILES.values()
    ]


def profile_to_info(p: BrandProfile):
    """档案 → 生成输入（装配动作：档案里的场景素材自动注入）"""
    from .models import DistilleryInfo
    return DistilleryInfo(
        name=p.distillery_name,
        location=p.location,
        product_name=p.product_name,
        price_range=p.price_range,
        target_audience=p.target_audience,
        selling_points=p.selling_points,
        brand_tone=p.brand_tone,
        extra_material="；".join(p.scene_materials) if p.scene_materials else None,
    )
