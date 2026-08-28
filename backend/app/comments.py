"""酒阵 Agent · 评论区互动建议（事实安全版）"""
from typing import Optional

from .models import CommentReply, CommentResponse

_RULES: list[tuple[str, list[str], str]] = [
    ("咨询价格", ["价格", "多少钱", "贵不贵", "价位"], "{product}当前参考价格为 {price}。具体活动和到手价以企业当期公示为准；如果您说一下是自饮、聚餐还是礼赠，我可以按场景说明这款酒是否合适。"),
    ("质疑真假", ["真假", "真的吗", "贴牌", "坤沙", "是不是"], "这个问题应该用可核验资料回答，不建议只靠一句口头承诺。关于 {product} 的产区、工艺、生产主体和防伪信息，请以企业提供的产品资料和瓶身标识为准；未确认的信息我们不替品牌编。"),
    ("要购买链接", ["链接", "哪买", "怎么买", "下单", "地址"], "可以的。请以 {name} 当前公开的官方销售渠道为准；如果后台已经配置官方链接，就直接发送，未配置时不要临时编一个商城或购买地址。"),
    ("礼赠场景", ["送礼", "包装", "礼盒", "档次"], "如果是礼赠，建议先确认预算、对象和场合，再看 {product} 的实际包装与产品资料。没有确认礼盒、手提袋或售后政策前，不建议在回复里直接承诺。"),
]


def _fallback(comment: str, product: str) -> CommentReply:
    return CommentReply(
        comment=comment,
        reply=f"感谢留言。关于「{comment[:14]}」，如果涉及{product}的具体工艺、规格、价格或售后，我们会优先按企业已确认资料回答；暂未确认的信息不会直接下结论。",
        intent="其他咨询",
    )


def gen_comment_replies(product: str, name: str, location: str, price: str,
                        comments: Optional[list[str]] = None) -> CommentResponse:
    demo_comments = [
        "这个酒多少钱一瓶？",
        "是坤沙工艺吗？现在贴牌的太多了",
        "在哪能买到？",
        "送长辈拿得出手吗？",
    ]
    items: list[CommentReply] = []
    for comment in (comments or demo_comments):
        for intent, keywords, template in _RULES:
            if any(k in comment for k in keywords):
                items.append(CommentReply(
                    comment=comment,
                    reply=template.format(product=product, name=name, location=location, price=price or "企业公示价"),
                    intent=intent,
                ))
                break
        else:
            items.append(_fallback(comment, product))
    return CommentResponse(items=items)
