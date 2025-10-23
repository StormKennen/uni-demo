/* eslint-disable prettier/prettier */
export interface GetSuperAppAiAgentInfoQuery {
    /** 智能体id  example: undefined */
    botId?: string
}
export interface GetSuperAppAiAgentInfoResOnboardingInfo {
    /** 开场白 智能体配置的开场白内容。开场白中如果设置了用户名称变量`{{user_name}}`，API 场景中需要业务方自行处理，例如展示开场白时将此变量替换为业务侧的用户名称  */
    prologue?: string
    /** 智能体配置的推荐问题列表  */
    suggestedQuestions?: Array<string>
}
export interface GetSuperAppAiAgentInfoRes {
    /** 智能体的描述信息  */
    description?: string
    /**   */
    onboardingInfo?: GetSuperAppAiAgentInfoResOnboardingInfo
}
export interface PostSuperAppAiAgentChatReq {
    /** 智能体id  */
    botId?: string
    /** 会话id  */
    conversationId?: string
    /** 用户输入的问答内容  */
    question?: string
}
export interface PostSuperAppAiAgentChatResResultData {
    /** 聊天内容的样式 1: 文本 2：卡片 3：list card  */
    contentType?: number
    /** 内容  */
    contentText?: string
    /** 智能体id  */
    botId?: string
    /** 状态 delta: 正在输出  completed: 输出完毕  */
    status?: string
    /** 类型: answer: 问题答案  follow_up: 推荐问题  */
    type?: string
    /** 会话id  */
    chatId?: string
}
export interface PostSuperAppAiAgentChatResResult {
    /**   */
    code?: number
    /**   */
    msg?: string
    /**   */
    data?: PostSuperAppAiAgentChatResResultData
}
export interface PostSuperAppAiAgentChatResErrorDetailsItem {
    /**  A URL/resource name that uniquely identifies the type of the serialized
protocol buffer message. This string must contain at least
one "/" character. The last segment of the URL's path must represent
the fully qualified name of the type (as in
`path/google.protobuf.Duration`). The name should be in a canonical form
(e.g., leading "." is not accepted).

In practice, teams usually precompile into the binary all types that they
expect it to use in the context of Any. However, for URLs which use the
scheme `http`, `https`, or no scheme, one can optionally set up a type
server that maps type URLs to message definitions as follows:

* If no scheme is provided, `https` is assumed.
* An HTTP GET on the URL must yield a [google.protobuf.Type][]
  value in binary format, or produce an error.
* Applications are allowed to cache lookup results based on the
  URL, or have them precompiled into a binary to avoid any
  lookup. Therefore, binary compatibility needs to be preserved
  on changes to types. (Use versioned type names to manage
  breaking changes.)

Note: this functionality is not currently available in the official
protobuf release, and it is not used for type URLs beginning with
type.googleapis.com. As of May 2023, there are no widely used type server
implementations and no plans to implement one.

Schemes other than `http`, `https` (or the empty scheme) might be
used with implementation specific semantics. */
    '@type'?: string
}
export interface PostSuperAppAiAgentChatResError {
    /**   */
    code?: number
    /**   */
    message?: string
    /**   */
    details?: Array<PostSuperAppAiAgentChatResErrorDetailsItem>
}
export interface PostSuperAppAiAgentChatRes {
    /**   */
    result?: PostSuperAppAiAgentChatResResult
    /**   */
    error?: PostSuperAppAiAgentChatResError
}
export interface PostSuperAppAiAgentChatCancelReq {
    /** 对话id  */
    chatId?: string
    /** 会话id  */
    conversationId?: string
}

export type PostSuperAppAiAgentChatCancelRes = any
export interface PostSuperAppAiAgentChatCreateMessageReqMetaData {
}
export interface PostSuperAppAiAgentChatCreateMessageReq {
    /** 会话id  */
    conversationId?: string
    /** 发送方 user: 用户发送  assistant: 智能体发送  */
    role?: string
    /** 消息的内容  */
    content?: string
    /** 消息的类型 text: 文本 object_string: 多模态消息 即文本和文件的组合、文本和图片的组合  */
    contentType?: string
    /** 可选消息  */
    metaData?: PostSuperAppAiAgentChatCreateMessageReqMetaData
}

export type PostSuperAppAiAgentChatCreateMessageRes = any
export interface GetSuperAppAiAgentChatDetailsQuery {
    /** 智能体id  example:  */
    botId?: string
    /** 回话id  example:  */
    conversationId?: string
    /** 翻页 id  example:  */
    messageId?: string
}

export type GetSuperAppAiAgentChatDetailsRes = any
export interface GetSuperAppAiAgentConversationRes {
    /** 会话id  */
    conversationId?: string
}
export interface GetSuperAppAiAgentEntranceResEntranceConfigItem {
    /** 卡片id  */
    id?: number
    /** 卡片标题  */
    title?: string
    /** 卡片icon  */
    icon?: string
    /** 入口封面  */
    cover?: string
    /** 描述文字  */
    description?: string
    /** 按钮文字  */
    btnText?: string
    /** 跳转方式  1: 页面跳转  2: app内部跳转  3: Agent跳转  4:不跳转  */
    redirectMode?: number
    /** 跳转信息(跳转的地址或者agent_id等)  */
    redirectPath?: string
    /**   */
    businessType?: string
}
export interface GetSuperAppAiAgentEntranceRes {
    /** 主bot_id  */
    mainBotId?: string
    /** 智能体入口页配置  */
    entranceConfig?: Array<GetSuperAppAiAgentEntranceResEntranceConfigItem>
}
