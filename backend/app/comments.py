"""酿见 AI · 评论区互动建议（事实安全规则版）"""
from typing import Optional

from .models import CommentReply, CommentResponse


_RULES: list[tuple[list[str], str]] = [
    (["价格", "多少钱", "贵不贵", "价位"], "咨询价格"),
    (["真假", "真的吗", "贴牌", "坤沙", "是不是", "工艺"], "事实核验"),
    (["链接", "哪买", "怎么买", "下单", "地址", "联系"], "购买渠道"),
    (["送礼", "包装", "礼盒", "档次", "聚餐", "场景"], "消费场景"),
]


def _intent(comment: str) -> str:
    for keywords, intent in _RULES:
        if any(k in comment for k in keywords):
            return intent
    return "其他咨询"


def _reply(intent: str, product: str, name: str, location: str, price: str) -> str:
    if intent == "咨询价格":
        if price:
            return f"{product}目前的产品信息里标注价位为 {price}。如果需要更具体的活动或渠道价格，建议以品牌当期官方信息为准。"
        return f"关于 {product} 的价格，目前档案里没有足够信息，建议先补充品牌当期价格资料后再对外回复。"

    if intent == "事实核验":
        return f"这个问题需要看 {name} 已确认的产品资料。当前回复不会自动承诺具体工艺、年份、窖池或溯源信息；有检测报告、瓶身标签或企业资料时，再把对应证据发给消费者会更稳妥。"

    if intent == "购买渠道":
        return f"目前档案里没有自动写入官方商城、包邮或售后承诺。可以先回复：『想了解 {product} 的正规购买方式，可以私信/联系品牌官方人员确认当前渠道。』"

    if intent == "消费场景":
        loc = f"{location}的" if location else ""
        return f"可以先根据具体需求推荐，而不是直接说“适合所有场合”。比如问清楚是家庭聚餐、朋友小聚还是礼赠，再结合{loc}{product}的价格和已确认产品信息给建议。"

    return f"感谢关注 {product}。这条问题当前档案信息还不够，建议先确认需求或补充企业资料后再回复，不为了显得专业而补写未经确认的事实。"


def gen_comment_replies(
    product: str,
    name: str,
    location: str,
    price: str,
    comments: Optional[list[str]] = None,
) -> CommentResponse:
    demo_comments = comments or [
        "这款酒多少钱？",
        "你们说的这个工艺有资料可以看吗？",
        "想了解一下，怎么联系？",
        "家里聚餐用，这款适合什么场景？",
    ]
    items: list[CommentReply] = []
    for comment in demo_comments:
        intent = _intent(comment)
        items.append(
            CommentReply(
                comment=comment,
                intent=intent,
                reply=_reply(intent, product, name, location, price),
            )
        )
    return CommentResponse(items=items)
