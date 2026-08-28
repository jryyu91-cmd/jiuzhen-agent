"""酒阵 Agent · 内容生成流水线

48 小时黑客松版本：模板 + 规则引擎驱动，保证离线可跑、演示稳定。
LLM 接入留了 `llm` 开关（USE_LLM 环境变量），现场网络不稳时自动降级到模板模式。

写作方法论（源自粥左罗人×AI共创营拆解，见知识库爆款方法论目录）：
- 开头：具体场景把读者拖进画面（不喊口号）
- 中段：段间递钩子，抽象概括换看得见的细节
- 收尾：最忌「综上所述」式总结。只做三件事之一——
  ①把全文的劲收成一句记得住的话 ②回扣开头闭环 ③给一个具体行动
- 人味三参数：具体度 / 判断浓度 / 在场感；AI 腔特征词见一个删一个

生活方式叙事（2026 行业趋势，见作品说明第 0 栏引用）：
- 白酒消费从「应酬驱动」转向「情绪价值驱动」——家庭小酌、朋友小聚、
  露营微醺、一人独酌等轻场景占比持续走高（中国酒业协会 2025 报告）
- 内容不讲「这是该继承的传统」，讲「这杯很懂你」：
  工艺只做信任背书（三分之一篇幅），生活场景才是主角
- 场景词库：下班到家、周末炖菜、老友上门、阳台夜风、烧烤摊、大排档
"""
import os

from .models import DistilleryInfo, GeneratedContent

USE_LLM = os.getenv("USE_LLM", "0") == "1"

# 生活方式场景库：生成时按目标人群轮换，避免千篇一律
LIFE_SCENES = [
    {
        "moment": "周五晚上，加完班到家，鞋一脱，饭还没好",
        "act": "从柜子里拿出这瓶，倒上一小杯，就着厨房飘来的烟火气先抿一口",
        "payoff": "一天的火气，到第三口的时候，就下去了",
    },
    {
        "moment": "周末在家炖肉，汤汁咕嘟了两个钟头",
        "act": "开一瓶{product}，自己先倒半杯，靠在厨房门口等肉烂",
        "payoff": "肉香混着酱香，这一顿饭还没上桌，就算成了",
    },
    {
        "moment": "老朋友难得上门，菜是临时炒的",
        "act": "桌上摆一瓶{product}，不用劝，倒上就行",
        "payoff": "好酒不吵，它就是把话头递给你们的那个",
    },
    {
        "moment": "夏天的晚上，阳台上有点风",
        "act": "一小杯{product}，一部看了一半的老电影",
        "payoff": "微醺就好，明天还要上班",
    },
]


def _selling_points_text(info: DistilleryInfo) -> str:
    if info.selling_points:
        return "、".join(info.selling_points)
    return "大曲坤沙工艺、赤水河谷产区、传统窖藏"


def _scene_anchor(info: DistilleryInfo) -> str:
    """从酒厂故事素材里取真实细节做人味锚点；没有就用产区常识兜底。"""
    if info.extra_material and len(info.extra_material.strip()) > 10:
        snippet = info.extra_material.strip().replace("\n", "，")[:60]
        return snippet
    return "酒师傅凌晨四点看酒醅，说这时候的酸香最骗不了人"


def _pick_scene(info: DistilleryInfo, index: int = 0) -> dict:
    """选生活场景：优先按用户填的消费场景关键词匹配，无则按人群推断。

    （修复：原实现 index % 1 恒为 0，场景轮换失效，只有 0/3 两个场景会被选中）
    """
    # 1) 用户填的典型消费场景优先：关键词 → 场景库映射
    scene_text = info.consume_scene or ""
    keyword_map = [
        (("炖菜", "炖肉"), 1),          # 周末炖菜
        (("烧烤", "聚会", "小聚", "朋友"), 2),  # 老友上门小聚
        (("阳台", "独酌", "一人"), 3),  # 阳台夜风
    ]
    for keywords, idx in keyword_map:
        if any(k in scene_text for k in keywords):
            return LIFE_SCENES[idx]
    # 2) 无场景词时按人群推断：年轻人群取更轻的场景（烧烤摊），默认下班到家
    young = any(k in info.target_audience for k in ("25", "年轻"))
    return LIFE_SCENES[(3 if young else 0) + index % len(LIFE_SCENES)]


def _tone_opener(info: DistilleryInfo) -> str:
    """消费 brand_tone：按品牌语气第一个词生成开场定调句（档案差异的第一眼）。"""
    tone = info.brand_tone.split("、")[0] if info.brand_tone else "实在"
    tone_map = {
        "轻松": "咱随便聊聊，不整虚的——",
        "朴实": "这几句话，说得实在——",
    }
    return tone_map.get(tone, f"按我们一贯的调子，{tone}地说——")


def _taboo_note(info: DistilleryInfo) -> str:
    """消费 tone_taboos：文末红线自查声明（建档酒厂独有，衬托「一厂一档」价值）。"""
    if info.tone_taboos:
        return f"\n> 编辑按（品牌红线自查）：{'；'.join(info.tone_taboos)}——这些坑，这篇一个没踩。\n"
    return ""


def gen_wechat(info: DistilleryInfo) -> GeneratedContent:
    """公众号文案：生活场景开头 → 工艺做信任背书 → 回到生活收尾（情绪价值闭环）"""
    sp = _selling_points_text(info)
    anchor = _scene_anchor(info)
    scene = _pick_scene(info)
    opener = _tone_opener(info)
    taboo = _taboo_note(info)
    title = f"成年人的酒，是留给自己的那半小时"
    body = f"""{scene['moment']}。

{scene['act']}。

{scene['payoff']}。

{opener}喝酒这件事，说到底喝的不是酒精，是这段时间归你。应酬桌上那叫任务，自己倒的这杯才叫生活——这也是我们想认真说说{info.product_name}的原因。

它是{info.name}的酒，{info.location}产的。{sp}——这些是底气，但今天不用多讲，讲多了像上课。你只需要知道：{anchor}。这瓶酒在你拧开瓶盖之前，已经被人这么盯了一个周期。

{info.price_range}。不贵，也不用搓着手等什么特殊日子。炖肉的时候开一瓶，老朋友来了开一瓶，或者就只是今晚风不错。

酒是酿出来等人喝的，不是供着看的。今晚那半小时，归你。
{taboo}
> 下一篇去看看制曲车间——一块曲砖的前四十天，比你想的热闹。
"""
    return GeneratedContent(
        channel="wechat",
        title=title,
        body=body,
        hashtags=["酱香型白酒", "生活方式", info.location],
    )


def gen_moments(info: DistilleryInfo) -> GeneratedContent:
    """朋友圈短文案：生活切面 + 情绪落点，产品只带一笔"""
    body = (
        "人到中年才懂，最好的酒局是没局。\n"
        "下班回家，饭菜上桌，自己倒的那杯最实在。\n"
        f"{info.product_name}，{info.price_range}，留给自己的那半小时。"
    )
    return GeneratedContent(
        channel="moments",
        title=None,
        body=body,
        hashtags=[f"#{info.product_name}", "#生活要有酒"],
    )


def gen_video_script(info: DistilleryInfo) -> GeneratedContent:
    """短视频脚本：从车间到餐桌——工艺半程、生活半程，落点在情绪"""
    sp = _selling_points_text(info)
    body = f"""【时长】约 30 秒 · 竖屏 9:16

【0-3s 钩子 · 生活特写】
画面：晚上九点，楼里灯一盏盏亮，男主开门进屋，把外卖袋放上桌
口播：「这届人喝酒，不为应酬了。」

【3-8s 转折 · 倒酒特写】
画面：开瓶、拉酒线、倒一小杯，酱香酒的挂杯
口播：「{info.product_name}，{sp}。{info.price_range}——是给自己喝的价位。」

【8-15s 工艺背书 · 快剪】
画面：酒师傅探酒醅/曲仓/窖池（三个快切，每个 2 秒）
口播：「在你开瓶之前，它在{info.location}被人这么盯了一整个周期。」

【15-25s 生活 · 主场景】
画面：饭桌热气、阳台夜风、老友碰杯（三个慢镜）
口播：「炖肉的时候来一杯，老朋友来了来一杯，或者就只是——今晚风不错。」

【25-30s 收尾 · 留白】
画面：杯子放下，人靠回椅背，灯光暖
口播（轻）：「酒是酿出来等人喝的。今晚那半小时，归你。」
字幕：{info.product_name} · {info.location}

【字幕贴纸建议】「给自己喝的价位」/「今晚那半小时，归你」
【BGM】前段低鼓点，15 秒后转暖色木吉他，收尾渐弱
"""
    return GeneratedContent(
        channel="video",
        title=f"{info.product_name} · 30秒「留给自己的半小时」脚本",
        body=body,
        hashtags=["短视频脚本", "白酒生活方式"],
    )


def run_pipeline(info: DistilleryInfo) -> tuple[list[GeneratedContent], list[str]]:
    anchor_src = "酒厂故事素材" if info.extra_material else "产区常识兜底"
    scene_src = f"消费场景「{info.consume_scene}」" if info.consume_scene else "目标人群推断"
    trace = [
        f"① 解析输入：{info.name} / {info.product_name} / 价格带 {info.price_range}",
        f"② 提取卖点 + 场景细节锚点（{anchor_src}）",
        f"③ 生活方式叙事装配：场景选取依据={scene_src}；工艺做背书（1/3），生活场景做主角（2/3）",
        "④ 并行生成三通道内容：公众号 → 朋友圈 → 短视频脚本",
        "⑤ 人味终审：具体度锚点 / 段间钩子 / 收尾禁总结（粥左罗共创方法论）",
    ]
    if info.tone_taboos:
        trace.append(f"⑤+ 品牌红线自查：{('、'.join(info.tone_taboos))} 已生效")
    if not USE_LLM:
        trace.append("⑥ 当前为模板模式（USE_LLM=0），接入 LLM 后本步骤替换为模型生成")
    contents = [gen_wechat(info), gen_moments(info), gen_video_script(info)]
    return contents, trace
