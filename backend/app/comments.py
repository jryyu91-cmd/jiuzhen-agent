"""酒阵 Agent · 评论区互动建议（规则版，演示稳定优先）"""
from typing import Optional

from .models import CommentReply, CommentResponse

_RULES: list[tuple[str, list[str], list[str]]] = [
    # (意图关键词列表, 示例评论列表, 回复模板列表)
    (
        ["价格", "多少钱", "贵不贵", "价位"],
        [
            "这个酒多少钱一瓶？",
            "搞活动的时候会不会便宜点？",
        ],
        [
            "您好，{product}目前是 {price}，产区直发。价格按酒厂公示走，不做虚高再打折那一套，您可以对比同价位酱酒。",
            "{price}，端午制曲重阳下沙的成本在那儿，这个价位我们主打的是「产区口粮」，欢迎先试后买。",
        ],
    ),
    (
        ["真假", "真的吗", "贴牌", "坤沙", "是不是"],
        [
            "是坤沙工艺吗？现在贴牌的太多了",
            "真的是茅台镇产的吗？",
        ],
        [
            "理解您的顾虑。{product}是{name}自有窖池出品，大曲坤沙工艺，瓶身有溯源码，扫一下能看到酿造批次和窖池编号。",
            "是的，{location}产区。我们敢把溯源码放瓶身上，就是欢迎您验。",
        ],
    ),
    (
        ["链接", "哪买", "怎么买", "下单", "地址"],
        [
            "链接发一下",
            "在哪能买到？",
        ],
        [
            "给您：小程序「{name}官方商城」或私信我发货地址，产区直发，顺丰包邮。",
            "主页小店和私信都可以下单，现在下单带产区防伪码，48 小时内发货。",
        ],
    ),
    (
        ["送礼", "包装", "礼盒", "档次"],
        [
            "送长辈拿得出手吗？",
            "有礼盒装吗？",
        ],
        [
            "有的，{product}有配套礼盒，遵义产区 + 窖藏年份的卖点写在盒面，长辈一看就懂，不会觉得是杂牌。",
            "送长辈很合适：酱酒自饮送礼两相宜，礼盒另配手提袋，您收到不满意可退。",
        ],
    ),
]


def _fallback(comment: str, product: str) -> CommentReply:
    return CommentReply(
        comment=comment,
        reply=f"感谢留言！关于「{comment[:12]}…」，{product}的详情和产区资料我私信发您，也可以直接告诉我您的需求（自饮/送礼/团购），给您针对性推荐。",
        intent="其他咨询",
    )


def gen_comment_replies(product: str, name: str, location: str, price: str,
                        comments: Optional[list[str]] = None) -> CommentResponse:
    """根据模拟评论生成回复建议。未传入时使用内置演示评论集。"""
    demo_comments = [c for _, cs, _ in _RULES for c in cs[:1]]
    items: list[CommentReply] = []
    for comment in (comments or demo_comments):
        matched = False
        for keywords, sample_comments, templates in _RULES:
            if any(k in comment for k in keywords):
                idx = sample_comments.index(comment) if comment in sample_comments else 0
                template = templates[idx % len(templates)]
                reply = template.format(product=product, name=name, location=location, price=price)
                intent = {
                    "价格": "咨询价格", "真假": "质疑真假", "链接": "要购买链接", "送礼": "送礼场景",
                }[keywords[0]]
                items.append(CommentReply(comment=comment, reply=reply, intent=intent))
                matched = True
                break
        if not matched:
            items.append(_fallback(comment, product))
    return CommentResponse(items=items)
