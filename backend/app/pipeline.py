"""酒阵 Agent · 场景化内容生成流水线（营销诊断后的执行层）"""
import os

from .models import DistilleryInfo, GeneratedContent

USE_LLM = os.getenv("USE_LLM", "0") == "1"

LIFE_SCENES = [
    {
        "moment": "周五晚上，饭菜刚端上桌，手机终于安静下来",
        "act": "桌上放着一瓶{product}，不用等什么正式酒局",
        "payoff": "这一桌的重点不是应酬，是把一顿普通饭吃得更有记忆点",
    },
    {
        "moment": "周末在家炖肉，厨房里一直冒着热气",
        "act": "{product}摆在家常菜旁边，和这一桌烟火气放在一起",
        "payoff": "白酒不一定只属于宴会，也可以属于一顿认真吃的晚饭",
    },
    {
        "moment": "老朋友难得上门，菜是临时炒的，话却有很多",
        "act": "{product}放在桌上，酒只是这次见面的一个陪衬",
        "payoff": "真正让人记住的，是朋友和这顿饭，不是劝了多少杯",
    },
    {
        "moment": "夜宵摊刚坐满，几个人点了烧烤和热菜",
        "act": "一瓶{product}和几道菜一起上桌，场景轻松，没有复杂仪式",
        "payoff": "对白酒来说，新的机会也许就在这些更日常、更轻的餐桌上",
    },
]


def _verified_points(info: DistilleryInfo) -> list[str]:
    """只返回有证据支撑的产品事实；没有证据时不自动编造工艺、年份或资质。"""
    verified: list[str] = []
    evidence_text = " ".join(f.value for f in info.fact_evidence)
    for point in info.selling_points:
        if point and (not info.fact_evidence or point in evidence_text):
            # 演示模式允许用户主动填写的卖点进入草稿，但合规层会继续标记证据缺口。
            verified.append(point)
    return verified


def _facts_text(info: DistilleryInfo) -> str:
    points = _verified_points(info)
    return "、".join(points) if points else "产品的具体工艺、产区和规格信息"


def _scene_anchor(info: DistilleryInfo) -> str:
    if info.extra_material and len(info.extra_material.strip()) > 10:
        return info.extra_material.strip().replace("\n", "，")[:80]
    return "目前还缺少这家酒厂独有的真实人物、车间或餐桌细节，正式发布前建议补充"


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


def _tone_opener(info: DistilleryInfo) -> str:
    tone = info.brand_tone.split("、")[0] if info.brand_tone else "可信"
    return {
        "轻松": "不讲复杂仪式，先从一顿普通饭说起——",
        "朴实": "不绕弯，先说一个真实的消费场景——",
    }.get(tone, f"按品牌一贯的{tone}语气来说——")


def gen_wechat(info: DistilleryInfo) -> GeneratedContent:
    scene = _pick_scene(info)
    facts = _facts_text(info)
    anchor = _scene_anchor(info)
    title = "白酒的新机会，可能不在下一场应酬里"
    body = f"""{scene['moment']}。

{scene['act'].format(product=info.product_name)}。

{scene['payoff']}。

{_tone_opener(info)}过去很多白酒内容总在讲宴请、身份和礼赠，但消费者的生活远不止这些场景。对{info.product_name}来说，更值得尝试的是：让产品进入具体的饭局、朋友见面和日常餐桌，而不是先给消费者上一堂工艺课。

关于产品本身，目前可以确认或需要继续核验的重点是：{facts}。真正能建立信任的，不是堆形容词，而是把这些事实和证据说清楚。

还有一类内容更值得长期积累：{anchor}。这些只有这家酒厂才有的真实细节，才是地方品牌区别于通用白酒文案的地方。

先把一款酒放进一个真实生活场景里，让消费者知道“什么时候会想到它”，再谈品牌心智。
"""
    return GeneratedContent(channel="wechat", title=title, body=body, hashtags=["白酒消费场景", "品牌内容", info.location])


def gen_moments(info: DistilleryInfo) -> GeneratedContent:
    scene = info.consume_scene or "一顿普通的朋友聚餐"
    body = (
        f"白酒不一定非要等到正式酒局。\n"
        f"{scene}，也可以成为它的新场景。\n"
        f"{info.product_name} · {info.price_range}\n"
        "先让消费者知道什么时候会想到这瓶酒，再慢慢讲产品本身。"
    )
    return GeneratedContent(channel="moments", body=body, hashtags=["#白酒生活方式", "#消费场景"])


def gen_video_script(info: DistilleryInfo) -> GeneratedContent:
    facts = _facts_text(info)
    body = f"""【时长】约 30 秒 · 竖屏 9:16

【0-4s】
画面：朋友聚餐、家常菜、夜宵摊三个生活镜头快切，不出现饮酒动作。
口播：「白酒的新机会，可能不在下一场应酬里。」

【4-10s】
画面：{info.product_name}产品静物 + 餐桌环境。
口播：「先别急着讲一堆工艺，先回答一个问题：它适合出现在什么生活场景？」

【10-20s】
画面：真实酒厂人物、车间、产区资料或可核验产品细节。
口播：「再把产品证据讲清楚：{facts}。没有资料支撑的卖点，不硬说。」

【20-27s】
画面：家庭聚餐、老友来访、烧烤夜宵等成年消费者场景。
口播：「从一个场景开始，让消费者知道什么时候会想到这瓶酒。」

【27-30s】
字幕：{info.product_name} · {info.location}
口播：「先进入生活，再进入心智。」
"""
    return GeneratedContent(channel="video", title=f"{info.product_name} · 场景化短视频脚本", body=body, hashtags=["白酒营销", "场景内容"])


def run_pipeline(info: DistilleryInfo) -> tuple[list[GeneratedContent], list[str]]:
    scene_src = f"企业输入场景「{info.consume_scene}」" if info.consume_scene else "由营销诊断反推场景"
    trace = [
        f"① 解析产品底层信息：{info.name} / {info.product_name} / {info.price_range}",
        "② 先做消费者与场景诊断，不要求用户先成为营销专家",
        f"③ 场景装配：{scene_src}",
        "④ 事实约束：没有企业资料支撑的工艺、年份、资质、物流等信息不自动编造",
        "⑤ 生成公众号 / 朋友圈 / 短视频三通道草稿",
        "⑥ 进入品牌事实与酒类营销合规检查",
    ]
    if info.tone_taboos:
        trace.append(f"⑥+ 品牌语气红线：{'、'.join(info.tone_taboos)}")
    if not USE_LLM:
        trace.append("⑦ 当前为规则版 MVP；后续可接 LLM + 行业知识库 + 历史经营数据")
    return [gen_wechat(info), gen_moments(info), gen_video_script(info)], trace
