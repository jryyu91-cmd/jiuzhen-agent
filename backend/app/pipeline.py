"""酿见 AI · 场景化内容生成流水线（营销诊断后的执行层）

规则版 Demo 的内容原则：
- 策略判断留在“策略诊断”里，不塞进最终文案；
- 成品只面向消费者说话，少讲营销术语和方法论；
- 从一个小场景切入，句子长短交替，允许留白；
- 不编造亲历、工艺、年份、资质、物流等未经确认的事实；
- 酒类内容不展示饮酒动作，不用“解压、消愁、增强状态”等表达。
"""
import os

from .models import DistilleryInfo, GeneratedContent

USE_LLM = os.getenv("USE_LLM", "0") == "1"

LIFE_SCENES = [
    {
        "key": "dinner",
        "moment": "周五晚上，饭菜刚端上桌，手机终于安静下来",
        "detail": "菜还冒着热气，朋友已经坐下，话题一会儿聊工作，一会儿又跑到几年前",
        "video_open": "周五晚上，几个人凑一桌家常菜。",
    },
    {
        "key": "home",
        "moment": "周末在家炖肉，厨房里一直冒着热气",
        "detail": "菜还没齐，人先到了，厨房门开开关关，桌上的位置慢慢坐满",
        "video_open": "周末家里炖着菜，朋友刚好来坐坐。",
    },
    {
        "key": "friends",
        "moment": "老朋友难得上门，菜是临时炒的，话却有很多",
        "detail": "没有特意准备什么仪式，椅子一拉开，聊天就接上了",
        "video_open": "老朋友见面，菜简单一点，话总是很多。",
    },
    {
        "key": "night",
        "moment": "周五夜里，烧烤刚上桌，几个人还在为最后一串肉让来让去",
        "detail": "桌子不大，菜摆得有点挤，旁边都是熟人说话的声音",
        "video_open": "周五夜宵，烧烤刚上，几个人已经聊开了。",
    },
]


def _verified_points(info: DistilleryInfo) -> list[str]:
    """只返回有证据支撑的产品事实；演示中用户主动填写的卖点可进入草稿，但会继续被合规层标记。"""
    verified: list[str] = []
    evidence_text = " ".join(f.value for f in info.fact_evidence)
    for point in info.selling_points:
        if point and (not info.fact_evidence or point in evidence_text):
            verified.append(point)
    return verified


def _facts_sentence(info: DistilleryInfo) -> str:
    points = _verified_points(info)
    if not points:
        return ""
    return f"这款目前确认的信息不多，先记住这几个就够了：{'、'.join(points)}。"


def _price_sentence(info: DistilleryInfo) -> str:
    price = (info.price_range or "").strip()
    return f"价格是{price}。" if price else ""


def _scene_anchor(info: DistilleryInfo) -> str:
    """只使用用户提供的真实/演示素材，不做事实补写。"""
    if not info.extra_material or len(info.extra_material.strip()) <= 10:
        return ""
    text = info.extra_material.strip().replace("\n", "，")
    text = text.replace("演示素材：", "")
    first = text.split("；")[0].strip("，；。 ")
    return first[:70]


def _pick_scene(info: DistilleryInfo) -> dict:
    scene_text = info.consume_scene or ""
    mapping = [
        (("炖菜", "炖肉", "家庭", "佐餐"), 1),
        (("朋友", "小聚", "老友"), 2),
        (("烧烤", "夜宵", "大排档"), 3),
    ]
    for keywords, idx in mapping:
        if any(k in scene_text for k in keywords):
            return LIFE_SCENES[idx]
    return LIFE_SCENES[0]


def gen_wechat(info: DistilleryInfo) -> GeneratedContent:
    scene = _pick_scene(info)
    facts = _facts_sentence(info)
    price = _price_sentence(info)
    anchor = _scene_anchor(info)

    title_map = {
        "night": "烧烤刚上桌的时候，酒其实不用讲那么多",
        "home": "朋友来家里吃顿饭，桌上那瓶酒不用太复杂",
        "friends": "老朋友见面，菜可以简单一点",
        "dinner": "有些酒，放在家常饭桌上反而更顺眼",
    }
    title = title_map.get(scene["key"], "有些酒，放在家常饭桌上反而更顺眼")

    fact_block = "\n\n".join(x for x in [facts, price] if x)
    anchor_block = f"\n\n还有一个我会想多看两眼的细节：{anchor}。\n\n这种东西不用讲得很大，留在镜头里、文章里，慢慢讲就行。" if anchor else ""

    body = f"""{scene['moment']}。

{scene['detail']}。

桌上放一瓶{info.product_name}。

酒放在这里，不需要抢什么戏。菜是热的，人是熟的，大家把这顿饭吃完，已经很好。{f'\n\n{fact_block}' if fact_block else ''}{anchor_block}

我反而挺喜欢这种状态。

没那么隆重，也不用等一个多正式的理由。

朋友到了，菜上桌了，就够了。"""

    return GeneratedContent(
        channel="wechat",
        title=title,
        body=body,
        hashtags=["白酒生活方式", "朋友小聚", info.location] if info.location else ["白酒生活方式", "朋友小聚"],
    )


def gen_moments(info: DistilleryInfo) -> GeneratedContent:
    scene = _pick_scene(info)
    points = _verified_points(info)
    fact_line = " · ".join(points[:2])
    product_line = " · ".join(x for x in [info.product_name, info.price_range, fact_line] if x)

    body = f"""{scene['moment']}。

{scene['detail']}。

这种桌上放一瓶{info.product_name}，我觉得挺顺眼。

{product_line}

不需要把气氛搞得很隆重。
朋友到了，菜是热的，慢慢聊。"""

    return GeneratedContent(
        channel="moments",
        body=body,
        hashtags=["#朋友小聚", "#日常餐桌"],
    )


def gen_video_script(info: DistilleryInfo) -> GeneratedContent:
    scene = _pick_scene(info)
    points = _verified_points(info)
    fact_voice = "、".join(points[:3])
    price_part = f"，{info.price_range}" if info.price_range else ""
    fact_part = f"。{fact_voice}" if fact_voice else ""

    body = f"""【时长】约 30 秒 · 竖屏 9:16

【0-4s】
画面：{scene['moment']}。拍菜、空杯、朋友落座，不出现饮酒动作。
口播：「{scene['video_open']}」

【4-10s】
画面：{info.product_name}放在桌边，镜头从菜慢慢带到产品。
口播：「桌上多一瓶{info.product_name}{price_part}，也不用特意等什么大场面。」

【10-18s】
画面：产品标签、包装细节，以及已经确认可以展示的产品资料。
口播：「{fact_voice + '。' if fact_voice else '产品信息慢慢看，先把能确认的讲清楚。'}」

【18-26s】
画面：朋友夹菜、聊天、上菜、烧烤翻面等生活镜头，不拍饮酒动作。
口播：「菜是热的，人是熟的。今晚主要还是见朋友。」

【26-30s】
画面：产品静物停两秒，背景保留餐桌环境声。
字幕：{info.product_name} · {info.location}
口播：「有空，坐下来吃顿饭。」
"""

    return GeneratedContent(
        channel="video",
        title=f"{info.product_name} · 朋友小聚场景短视频",
        body=body,
        hashtags=["白酒生活方式", "朋友小聚"],
    )


def run_pipeline(info: DistilleryInfo) -> tuple[list[GeneratedContent], list[str]]:
    scene_src = f"企业输入场景「{info.consume_scene}」" if info.consume_scene else "由营销诊断反推场景"
    trace = [
        f"① 解析产品底层信息：{info.name} / {info.product_name} / {info.price_range}",
        "② 先做消费者与场景诊断，不要求用户先成为营销专家",
        f"③ 场景装配：{scene_src}",
        "④ 事实约束：没有企业资料支撑的工艺、年份、资质、物流等信息不自动编造",
        "⑤ 内容层只面向消费者表达：不把策略判断、营销术语和方法论塞进成品",
        "⑥ 生成公众号 / 朋友圈 / 短视频三通道草稿",
        "⑦ 进入品牌事实与酒类营销合规检查",
    ]
    if info.tone_taboos:
        trace.append(f"⑦+ 品牌语气红线：{'、'.join(info.tone_taboos)}")
    if not USE_LLM:
        trace.append("⑧ 当前为规则版 MVP；后续可接 LLM + 行业知识库 + 历史经营数据")
    return [gen_wechat(info), gen_moments(info), gen_video_script(info)], trace
