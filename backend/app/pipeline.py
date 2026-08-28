"""酒阵 Agent · 内容生成流水线

48 小时黑客松版本：模板 + 规则引擎驱动，保证离线可跑、演示稳定。
LLM 接入留了 `llm` 开关（USE_LLM 环境变量），现场网络不稳时自动降级到模板模式。

写作方法论（源自粥左罗人×AI共创营拆解，见知识库爆款方法论目录）：
- 开头：具体场景把读者拖进画面（不喊口号）
- 中段：段间递钩子，抽象概括换看得见的细节
- 收尾：最忌「综上所述」式总结。只做三件事之一——
  ①把全文的劲收成一句记得住的话 ②回扣开头闭环 ③给一个具体行动
- 人味三参数：具体度 / 判断浓度 / 在场感；AI 腔特征词见一个删一个
"""
import os

from .models import DistilleryInfo, GeneratedContent

USE_LLM = os.getenv("USE_LLM", "0") == "1"


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


def gen_wechat(info: DistilleryInfo) -> GeneratedContent:
    """公众号文案：场景开头 → 细节展开 → 柔收尾（一句记忆点+具体行动，不说教）"""
    sp = _selling_points_text(info)
    anchor = _scene_anchor(info)
    title = f"在{info.location}，一瓶{info.product_name}是怎么酿出来的"
    body = f"""赤水河谷的雾还没散，酒甑已经上汽了。{anchor}。在{info.location}，酿酒这件事是按月算的——端午制曲，重阳下沙，一年一个周期，急不来。

{info.name}的{info.product_name}，守的还是这套老规矩：{sp}。

这些词，喝惯酱酒的人不陌生。但真正分出高下的，是每个环节里差的那一点——曲温高一度，酒就燥；窖池多老一天，酒就柔一分。机器测得出温度，测不出「这批曲今天状态对不对」，这一眼，还是得老师傅来看。

所以这瓶酒到 you 手里之前，先经过的是人的眼睛和鼻子，然后才是化验单。这也是为什么它的产量做不大——一年就这么多轮次，酒就这么多。

价格是{info.price_range}。这个价位，说不上捡漏，但你对得起喝进嘴里的每一口。要是哪天路过{info.location}，不妨去窖区边上看一眼——看过酒醅怎么翻，你再端起这杯酒，味道会不太一样。

> 下一篇，我们去看制曲车间：一块曲砖的前四十天。
"""
    body = body.replace("you", "你")
    return GeneratedContent(
        channel="wechat",
        title=title,
        body=body,
        hashtags=["酱香型白酒", info.location, "白酒文化"],
    )


def gen_moments(info: DistilleryInfo) -> GeneratedContent:
    """朋友圈短文案：场景感 + 留白，不硬推销"""
    sp = _selling_points_text(info).split("、")[0]
    body = (
        f"老酒师傅有句话：曲温高一度，酒就燥一分。\n"
        f"{info.product_name}，{sp}，{info.price_range}。\n"
        f"不多酿，酿透。想尝的跟我说一声就行。"
    )
    return GeneratedContent(
        channel="moments",
        title=None,
        body=body,
        hashtags=[f"#{info.product_name}", "#酱酒日常"],
    )


def gen_video_script(info: DistilleryInfo) -> GeneratedContent:
    """短视频脚本：人出场、细节递进、柔收尾（不说「链接在评论区」收场）"""
    sp = _selling_points_text(info)
    body = f"""【时长】约 25 秒 · 竖屏 9:16

【0-3s 钩子 · 特写】
画面：清晨车间，酒师傅伸手探酒醅，热气糊上手背
口播：「酒好不好，他先不看酒，先摸这个。」

【3-10s 产区 · 空镜】
画面：赤水河谷雾气、酒甑上汽、曲仓特写
口播：「端午制曲，重阳下沙。{info.name}一年就等这两次。」

【10-18s 产品 · 手持】
画面：手持{info.product_name}转动瓶身，倒酒拉酒线
口播：「{sp}。{info.price_range}，产量不大——一年就这几个轮次。」

【18-25s 收尾 · 人物】
画面：师傅倒一小杯，自己抿一口，没说话，看了一眼窗外
口播（轻）：「酒酿出来了，剩下的，交给喝酒的人。」
字幕：{info.product_name} · {info.location}

【字幕贴纸建议】产区名/价格带/「一年这几个轮次」
【BGM】低鼓点国风节奏，收尾处渐弱留白
"""
    return GeneratedContent(
        channel="video",
        title=f"{info.product_name} · 25秒产区口播脚本",
        body=body,
        hashtags=["短视频脚本", "白酒营销"],
    )


def run_pipeline(info: DistilleryInfo) -> tuple[list[GeneratedContent], list[str]]:
    anchor_src = "酒厂故事素材" if info.extra_material else "产区常识兜底"
    trace = [
        f"① 解析输入：{info.name} / {info.product_name} / 价格带 {info.price_range}",
        f"② 提取卖点关键词 + 场景细节锚点（{anchor_src}）",
        "③ 并行生成三通道内容：公众号 → 朋友圈 → 短视频脚本",
        "④ 人味终审：具体度锚点 / 段间钩子 / 收尾禁总结（粥左罗共创方法论）",
    ]
    if not USE_LLM:
        trace.append("⑤ 当前为模板模式（USE_LLM=0），接入 LLM 后本步骤替换为模型生成")
    contents = [gen_wechat(info), gen_moments(info), gen_video_script(info)]
    return contents, trace
