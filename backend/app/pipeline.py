"""酒阵 Agent · 内容生成流水线

48 小时黑客松版本：模板 + 规则引擎驱动，保证离线可跑、演示稳定。
LLM 接入留了 `llm` 开关（USE_LLM 环境变量），现场网络不稳时自动降级到模板模式。
"""
import os

from .models import DistilleryInfo, GeneratedContent

USE_LLM = os.getenv("USE_LLM", "0") == "1"


def _selling_points_text(info: DistilleryInfo) -> str:
    if info.selling_points:
        return "、".join(info.selling_points)
    return "大曲坤沙工艺、赤水河谷产区、传统窖藏"


def gen_wechat(info: DistilleryInfo) -> GeneratedContent:
    """公众号文案：产区故事切入 -> 卖点 -> 场景收尾"""
    sp = _selling_points_text(info)
    title = f"在{info.location}，一瓶{info.product_name}是怎么酿出来的"
    body = f"""**开头 · 产区故事**

赤水河谷的清晨，雾还没散，酒甑已经上汽。在{info.location}，酿酒是一件按月计算的事——端午制曲，重阳下沙，一年一个周期，急不来。

**中段 · 卖点展开**

{info.name}的{info.product_name}，坚持的仍是老规矩：{sp}。

对喝惯了酱酒的人来说，这些词不陌生。但真正决定一瓶酒是不是"正"的，是每个环节都差的那一点点——曲的温度高一度，酒就燥；窖池老一天，酒就柔一分。

**场景收尾**

{info.target_audience}，喝酒喝的不只是味道，是"这瓶酒拿得出手、喝得下去"。{info.price_range}的价格带，{info.product_name}想做的，就是让产区的好酒，回到它该在的餐桌上。

> 下期预告：走进{info.name}的制曲车间，看一块曲砖的前 40 天。

---
*本文由酒阵 Agent 基于{info.name}提供的产品资料生成，品牌语气：{info.brand_tone}。*
"""
    return GeneratedContent(
        channel="wechat",
        title=title,
        body=body,
        hashtags=["酱香型白酒", info.location, "白酒文化"],
    )


def gen_moments(info: DistilleryInfo) -> GeneratedContent:
    """朋友圈短文案：60 字内，场景 + 钩子"""
    sp = _selling_points_text(info).split("、")[0]
    body = (
        f"同样是酱酒，为什么{info.location}的更顺？\n"
        f"答案在{sp}里。\n"
        f"{info.product_name}，{info.price_range}，"
        f"今晚开一瓶，评论区聊聊。🍶"
    )
    return GeneratedContent(
        channel="moments",
        title=None,
        body=body,
        hashtags=[f"#{info.product_name}", "#酱酒日常"],
    )


def gen_video_script(info: DistilleryInfo) -> GeneratedContent:
    """短视频脚本：15-30 秒口播 + 空镜结构"""
    sp = _selling_points_text(info)
    body = f"""【时长】约 25 秒 · 竖屏 9:16

【0-3s 钩子 · 特写】
画面：酒线拉高冲进杯中，泡沫翻起
口播：「在{info.location}，判断一瓶酱酒正不正，先看这一线。」

【3-10s 产区 · 空镜】
画面：赤水河谷航拍/雾气/酒甑上汽
口播：「端午制曲，重阳下沙。{info.name}还是老规矩。」

【10-18s 产品 · 手持】
画面：手持{info.product_name}，转动瓶身展示细节
口播：「{sp}。{info.price_range}，这个价位，它想讲的是产区的诚意。」

【18-25s 收尾 · 人物】
画面：倒酒、碰杯、饮后微点头
口播：「{info.product_name}，从{info.location}来的酒。链接在评论区。」

【字幕贴纸建议】产区名/价格带/「评论区」箭头
【BGM】低鼓点国风节奏，音量压在人声下
"""
    return GeneratedContent(
        channel="video",
        title=f"{info.product_name} · 25秒产区口播脚本",
        body=body,
        hashtags=["短视频脚本", "白酒营销"],
    )


def run_pipeline(info: DistilleryInfo) -> tuple[list[GeneratedContent], list[str]]:
    trace = [
        f"① 解析输入：{info.name} / {info.product_name} / 价格带 {info.price_range}",
        "② 提取卖点关键词并规范产区表述",
        "③ 并行生成三通道内容：公众号 → 朋友圈 → 短视频脚本",
        "④ 统一品牌语气与产区事实校验",
    ]
    if not USE_LLM:
        trace.append("⑤ 当前为模板模式（USE_LLM=0），接入 LLM 后本步骤替换为模型生成")
    contents = [gen_wechat(info), gen_moments(info), gen_video_script(info)]
    return contents, trace
