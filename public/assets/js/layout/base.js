// 发起GET请求
const Get = (url = '', params = {}, config = {}) => {
    // 定义 Token
    const headers  = {token:INIS.token}
    // 合并 headers 数据
    config.headers = {...headers, ...config?.headers}
    return inisHelper.fetch.get(INIS.api + url, params, config)
}

// 发起POST请求
const Post = (url = '', params = {}, config = {}) => {
    // 定义 Token
    const headers  = {token:INIS.token}
    // 合并 headers 数据
    config.headers = {...headers, ...config.headers}
    return inisHelper.fetch.post(INIS.api + url, params, config)
}

// 发起PUT请求
const Put = (url = '', params = {}, config = {}) => {
    // 定义 Token
    const headers  = {token:INIS.token}
    // 合并 headers 数据
    config.headers = {...headers, ...config.headers}
    return inisHelper.fetch.put(INIS.api + url, params, config)
}

// 发起DELETE请求
const Del = (url = '', params = {}, config = {}) => {
    // 定义 Token
    const headers  = {token:INIS.token}
    // 合并 headers 数据
    config.headers = {...headers, ...config.headers}
    return inisHelper.fetch.put(INIS.api + url, params, config)
}
// 通知模块
const Notify = (content = '通知', type = 'info', config = {}) => {
    config = {...{title:null, position: 'top-right', color: 'rgba(0,0,0,0.2)'}, ...config}
    $.NotificationApp.send(config.title, content, config.position, config.color, type);
}

// 自定义指令
const directives = {
    // 代码高亮的自定义指令
    highlight: (el) => {
        el.querySelectorAll('pre').forEach((pre) => {
            // 检查初始化
            const code = pre.querySelector('code')
            hljs.highlightBlock(code)
            // 显示行号
            code.innerHTML = "<ul><li>" + code.innerHTML.replace(/\n/g, "\n</li><li>") + "\n</li></ul>";
            // 添加头
            let language = null
            code.classList.forEach((className) => {
                if (className.indexOf("language-") != -1) language = className.split('-')[1]
            })
            let pre_head = document.createElement("div")
            pre_head.classList.add('pre-head')
            pre_head.innerHTML = "<p><span class='code-language'>" + language.toUpperCase() + "</span><span class='copy'><img class='w-auto mr-1' src='/assets/svg/tag.svg' />复制</span></p>";
            code.parentNode.insertBefore(pre_head, code)
            // 创建修复滚动条白点
            let repair = document.createElement("span")
            repair.classList.add("repair")
            code.parentNode.insertBefore(repair, code)
        })
        // 复制操作
        el.querySelectorAll('pre').forEach((item) => {
            $(item).find('.copy').click(() => {
                let result = inisHelper.set.copy.text($(item).find('code').text())
                if (result) $(item).find(".copy").html("<img class='w-auto mr-1' src='/assets/svg/tag.svg' />已复制</span>")
            })
        })
    },
    imagebox: (el) => {
        const images = el.getElementsByTagName("img")
        for (let item of images) {
            // 给图片上预览盒子
            item.outerHTML = `<a data-fancybox="gallery" href="${item.src}" data-caption="${item.alt}">${item.outerHTML}</a>`
        }
    }
}

// 自定义组件
const components = {
    // 评论框
    commentBox: () => {
        return {
            data(){
                return {
                    vditor: {},
                    comment: {
                        pid: 0,             // 父级评论ID
                        url: '',            // 网址
                        email: '',          // 邮箱
                        content: '',        // 内容
                        nickname: '',       // 昵称
                        article_id: '',     // 文章ID
                    },
                    is: {
                        load : false,       // 加载中
                        login: false,       // 已登录
                    },
                    emoji: {},
                    show: {
                        vditor: false,      // vditor 显示
                    }
                }
            },
            // aid => 文章ID, placeholder => 评论框描述
            // props: ['aid','placeholder','pid'],
            props: {
                aid: {
                    type: String,
                    default: '',
                },
                placeholder: {
                    type: String,
                    default: '',
                },
                pid: {
                    type: String,
                    default: '',
                },
                config: {
                    type: Object,
                    default: {}
                },
                btn: {
                    type: String,
                    default: '发表',
                }
            },
            mounted(){
                if (!inisHelper.is.empty(this.aid)) this.comment.article_id = this.aid
                if (!inisHelper.is.empty(this.pid)) this.comment.pid = this.pid
                this.comment = {...this.comment, ...this.config}
            },
            methods:{
                hasEmoji(el, config = {}){
                    const cache = 'emoji'
                    // 本地存在缓存
                    if (inisHelper.has.session(cache)) {
                        this.emoji = inisHelper.get.session(cache)
                        setTimeout(() => {
                            this.initVditor(el, config)
                        }, 200)
                    }
                    // 不存在缓存，从服务器端获取
                    else this.initEmoji(el, config)
                },
                initEmoji(el, config = {}){
                    const cache = 'emoji'
                    Get('emoji').then((res) => {
                        if (res.code == 200) {
                            this.emoji = res.data
                            inisHelper.set.session(cache, res.data)
                            this.initVditor(el, config)
                        }
                    }).catch(err=>{
                        this.initEmoji(el, config)
                    })
                },
                // 初始化编辑器
                initVditor(el, config = {}){
                    let options = {
                        value: this.comment?.content,
                        cdn: 'https://cdn.inis.cc/comm/libs/vditor',
                        height: 200,
                        minHeight: 200,
                        placeholder: this.placeholder || '说点什么吧 (支持Mackdown语法！) * ... ... ',
                        mode: 'wysiwyg',
                        icon: 'material',           // 图标风格
                        toolbarConfig: {
                            pin: true,              // 固定工具栏
                        },
                        cache: {
                            enable: false,          // 关闭缓存
                        },
                        counter: {
                            enable: true,           // 启用计数器
                        },
                        resize: {
                            enable: true,           // 支持主窗口大小拖拽
                        },
                        preview: {
                            hljs: {
                                enable: true,       // 启用代码高亮
                                lineNumber: true,   // 启用行号
                            },
                            math: {
                                engine: 'MathJax',
                            }
                        },
                        // 编辑器异步渲染完成后的回调方法
                        after: () => {
                            this.show.vditor = true
                        },
                        // 快捷键
                        ctrlEnter: () => {
                            this.check()
                        },
                        hint: {
                            emoji: this.emoji,
                        },
                        upload: {
                            accept: 'image/*, video/*',
                            multiple: false,
                            // 上传失败自定义方法
                            handler: (files) => {

                                // window.vditor.tip('上传中...', 2000)
                                //
                                // let params = new FormData
                                // params.append('file', ...files)
                                // params.append('mode', 'file')
                                //
                                // axios.post('/admin/handle/upload', params, {
                                //     headers: {
                                //         "Content-Type": "multipart/form-data"
                                //     }
                                // }).then((res) => {
                                //     if (res.data.code == 200) {
                                //
                                //         let result = res.data.data
                                //         if (this.checkFile(result) == 'image') {
                                //             window.vditor.insertValue(`![](${result})`)
                                //         } else if (this.checkFile(result) == 'video') {
                                //             window.vditor.insertValue(`<video src="${result}" controls>Not Support</video>`)
                                //         } else {
                                //             window.vditor.insertValue(`${result}`)
                                //         }
                                //
                                //         window.vditor.tip('上传完成！', 2000)
                                //
                                //     } else {
                                //         window.vditor.tip(res.data.msg, 2000)
                                //     }
                                // })
                            },
                            filename: (name) => {
                                return name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, "")
                                    .replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, "")
                                    .replace("/\\s/g", "");
                            },
                        },
                        toolbar: [
                            "emoji","headings","bold","italic","strike","link",
                            "|",
                            "list","ordered-list","check","outdent","indent",
                            "|",
                            "quote","line","code","inline-code","insert-before","insert-after",
                            "|","table",
                            {
                                hotkey: "",
                                name: "album",
                                tipPosition: "s",
                                tip: "插入相册",
                                className: "right",
                                icon: `<img src='/assets/svg/album.svg' height="16">`,
                                click: () => {
                                    this.vditor.insertValue('[album]\n支持Markdown格式和HTML格式的图片\n[/album]')
                                }
                            },
                            "edit-mode","help",
                            "|",
                            "undo","redo",
                        ],
                    }
                    // 对象深度合并
                    config = inisHelper.object.deep.merge(options, config)
                    this.vditor   = new Vditor(el, config)
                    window.vditor = this.vditor
                },
                // 前置校验
                check(){
                    if (inisHelper.is.empty(this.vditor.getValue())) Notify('您可以说点什么哟~','warning')
                    else {
                        // 登录后评论
                        if (this.userInfo.login) this.send()
                        // 未登录评论
                        else {
                            if (inisHelper.is.empty(this.comment.nickname))    Notify('你的名字为什么不愿意告诉我呢，好神秘啊~','warning')
                            else if (inisHelper.is.empty(this.comment.email))  Notify('不写邮箱，是在拒绝我的回应吗？过分~','warning')
                            else if (!inisHelper.is.email(this.comment.email)) Notify('给了个假邮箱，太坏了，哼~','warning')
                            else this.send()
                        }
                    }
                },
                // 发送评论
                send(){
                    // 加载中
                    this.is.load = true
                    this.comment.content = inisHelper.html2md(this.vditor.getHTML())
                    // 发送评论
                    Post('comments', this.comment,{
                        headers: this.userInfo.login ? {
                            Authorization: this.userInfo.token
                        } : {}
                    }).then(res=>{
                        if (res.code == 200) {
                            Notify('爱你哟！♥','success')
                            this.$emit('finish')
                            // 恢复默认数据
                            this.vditor.setValue('')
                            this.comment = {...this.comment, ...{pid:0,content:''}}
                        } else Notify(res.msg,'error')
                        this.is.load = false
                    })
                },
                // 取消评论
                cancel(){
                    this.$emit('cancel',0)
                },
                empty: (data) => inisHelper.is.empty(data),
            },
            directives: {
                vditor: {
                    // 初始化指令
                    mounted(el, binding) {
                        binding.instance.hasEmoji(el, {
                            height: inisHelper.is.mobile() ? 300 : 200,
                            minHeight: inisHelper.is.mobile() ? 300 : 200,
                        })
                    },
                    // 注销指令
                    unmounted(el, binding) {
                        window.vditor.destroy()
                    },
                }
            },
            computed: {
                userInfo(){
                    let result = {
                        data : {},
                        token: null,
                        login: false
                    }
                    if (inisHelper.has.cookie('LOGIN-TOKEN')) {
                        result = {
                            data : inisHelper.get.session('USER-INFO'),
                            token: inisHelper.get.cookie('LOGIN-TOKEN'),
                            login: true
                        }
                    } else result.login = false
                    return result
                }
            },
            template: `<div v-if="!show.vditor" class="flex-center">
                    <div class="spinner-border text-light m-2 wh-16px" role="status"></div>
                    Vditor 编辑器加载中 ... 
                </div>
                <div v-show="show.vditor" v-vditor></div>
                <div v-if="show.vditor && !userInfo.login" class="row">
                    <div class="col-lg-4">
                        <input type="text" class="form-control customize-input" placeholder="昵称*：" v-model.trim="comment.nickname">
                    </div>
                    <div class="col-lg-4">
                        <input type="text" class="form-control customize-input" placeholder="邮箱*：" v-model.trim="comment.email">
                    </div>
                    <div class="col-lg-4">
                        <input type="text" class="form-control customize-input" placeholder="网址：" v-model.trim="comment.url">
                    </div>
                </div>
                <div v-if="show.vditor" class="row pt-2">
                    <!-- 发表评论 -->
                    <div class="col-lg-12">
                        <button v-if="!is.load" v-on:click="check()" type="button" class="btn btn-outline-info btn-sm float-end">
                            <i class="mdi mdi-star-outline mdi-spin"></i> {{btn}}
                        </button>
                        <button v-else type="button" class="btn btn-outline-info btn-sm float-end" disabled>
                            <div class="spinner-border text-light is-load me-1" role="status"></div> 发送中 ...
                        </button>
                            <button v-if="!empty(placeholder)" v-on:click="cancel()" type="button" class="btn btn-outline-danger btn-sm float-end me-2">取消</button>
                    </div>
                </div>`,
        }
    },
    // 文章评论内容组件
    commentArticle: () => {
        return {
            data(){
                return {
                    comments: {
                        data: [],
                        page: 0,        // 总页码
                        count: 0
                    },
                    page: {
                        code: 1,        // 当前页码
                        load: false,
                        end : false,     // 最后一页
                        list: [],
                        show: false,
                    },
                    box: {
                        id: 0,
                        nickname: '',
                    }
                }
            },
            // id => 文章ID
            // props: ['id','config'],
            props: {
                id: {},
                config: {
                    type: Object,
                    default: () => {
                        return {
                            show: true,
                            allow: true,
                        }
                    }
                }
            },
            mounted(){
                this.hasComment()
            },
            methods: {
                // 检查本地缓存
                hasComment(page = 1) {
                    const cache = inisHelper.stringfy({api: 'comments', id: this.id, limit: 5, page})
                    if (inisHelper.has.session(cache)) {
                        // 更新当前页码
                        this.page.code = page
                        const comments = inisHelper.get.session(cache)
                        this.comments  = comments
                        // 最后一页
                        this.page.end  = this.page.code >= comments.page ? true : false
                    } else this.getComment(page)
                },
                // 获取评论数据
                getComment(page = this.page.code) {
                    const cache = inisHelper.stringfy({api: 'comments', id: this.id, limit: 5, page})
                    // 非最后一页获取数据
                    if (!this.page.end) Get('comments', {
                        article_id: this.id, limit: 5, page, tree: false
                    }).then(res => {
                        if (res.code == 200) {
                            // 更新当前页码
                            this.page.code= page
                            this.comments = res.data
                            inisHelper.set.session(cache, res.data)
                            // 最后一页
                            this.page.end = this.page.code >= res.data.page ? true : false
                        }
                    })
                },
                // 设置评论框ID
                setBoxId(id){
                    this.box.id = 0
                },
                // 评论成功
                finish(){
                    const cache = inisHelper.stringfy({api: 'comments', id: this.aid})
                    // 清理评论相关缓存
                    for (let item in sessionStorage.valueOf()) if (item.indexOf(cache) != -1) {
                        sessionStorage.removeItem(item)
                    }
                    this.box.id = 0
                    // 更新评论
                    this.hasComment()
                },
                // 是否为空
                empty: (data) => inisHelper.is.empty(data)
            },
            watch: {
                box: {
                    handler(){
                        // 隐藏第一个评论框
                        const box = document.querySelector('#article .first-comment-box')
                        box.style.display = this.box.id != 0 ? 'none' : 'block'
                    },
                    deep: true,
                },
                comments: {
                    handler() {
                        // 是否显示分页
                        this.page.show = this.comments.page != 1 ? true : false
                        // 页码列表
                        this.page.list = inisHelper.create.paging(this.page.code, this.comments.page, 5)
                    },
                    deep: true
                }
            },
            components: {
                'comment-box': components.commentBox(),
            },
            directives: {
                highlight: {
                    // 在base.js封装了公共方法
                    mounted: (el) => directives.highlight(el)
                }
            },
            template: `<div v-highlight class="media mt-2 row markdown comments">
                <!-- 评论 - 开始 -->
                <div v-for="(item, index) in comments.data" :key="index" class="card-body inbox-widget col-lg-12 py-0 px-lg-3 px-0">
                    <div class="inbox-item">
                        <div class="inbox-item-img w-auto">
                            <a :href="item.url">
                                <img :src="item.expand.head_img" class="rounded-circle img-thumbnail avatar-sm w-100">
                            </a>
                        </div>
                        <h5 class="inbox-item-author mt-0">
                            <a :href="item.url" class="text-secondary font-13">{{item.nickname}}</a>
                            <span v-if="config.allow" v-on:click="box = {id:item.id,nickname:item.nickname}" class="badge bg-dark ms-2 cursor reply">回复</span>
                        </h5>
                        <p class="inbox-item-text">{{item.create_time}}</p>
                        <p v-html="item.expand.html" class="text-muted mb-0"></p>
                    </div>
                    <div v-if="box.id == item.id" class="card">
                        <div class="card-body p-lg-3 p-2">
                            <comment-box :pid="item.id" :aid="id" :placeholder="'回复 @' + box.nickname" v-on:cancel="setBoxId" v-on:finish="finish"></comment-box>
                        </div>
                    </div>
                    <!-- 回复 - 开始 -->
                    <div v-for="(reply, index) in item.son" :key="index" class="inbox-item ml-3 ml-lg-5">
                        <div class="inbox-item-img w-auto">
                            <a :href="reply.expand.url" target="_blank">
                                <img :src="reply.expand.head_img" class="rounded-circle img-thumbnail avatar-sm w-100">
                            </a>
                        </div>
                        <h5 class="inbox-item-author mt-0">
                            <a :href="reply.expand.url" class="text-secondary font-13">{{reply.nickname}}</a>
                            <span v-if="reply.pid != item.id" class="text-muted font-13 mx-2">回复</span>
                            <span v-if="reply.pid != item.id" class="text-secondary font-13">@{{reply.expand.pid.nickname}}</span>
                            <span v-if="config.allow" v-on:click="box = {id:reply.id,nickname:reply.nickname}" class="badge bg-dark ms-2 cursor reply">回复</span>
                        </h5>
                        <p class="inbox-item-text">{{reply.create_time}}</p>
                        <p v-html="reply.expand.html" class="text-muted mb-0"></p>
                        <div v-if="box.id == reply.id" class="card">
                            <div class="card-body p-lg-3 p-2">
                                <comment-box :pid="reply.id" :aid="id" :placeholder="'回复 @' + box.nickname" v-on:cancel="setBoxId" v-on:finish="finish"></comment-box>
                            </div>
                        </div>
                    </div>
                    <!-- 回复 - 结束 -->
                </div>
                <!-- 评论 - 结束 -->
            </div>
            <div v-if="page.show && !empty(page.list)" class="flex-center">
                <div class="btn-group">
                    <button v-on:click="hasComment(1)" type="button" class="btn btn-light btn-sm"><i class="mdi mdi-chevron-left"></i></button>
                    <button v-for="(item, index) in page.list" :key="index" v-on:click="hasComment(item)" :class="(item == page.code) ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-light'">
                        {{item}}
                    </button>
                    <button v-on:click="hasComment(comments.page)" type="button" class="btn btn-light btn-sm"><i class="mdi mdi-chevron-right"></i></button>
                </div>
            </div>
            `
        }
    },
    // vditor编辑器框
    vditorBox: () => {
        return {
            data(){
                return {
                    vditor: {},
                    is: {
                        load : false,       // 加载中
                        login: false,       // 已登录
                    },
                    emoji: {},
                    show: {
                        vditor: false,      // vditor 显示
                    },
                    configs: {
                        content: '',
                        btnText: '发表',
                        text: {
                            send: '发表',
                            load: '发送中 ...',
                        },
                        placeholder: '说点什么吧 (支持Mackdown语法！) * ... ... ',
                    },
                }
            },
            props: {
                config: {
                    type: Object,
                    default: {
                        content: '',
                        btnText: '发表',
                        text: {
                            send: '发表',
                            load: '发送中 ...',
                        },
                        placeholder: '说点什么吧 (支持Mackdown语法！) * ... ... ',
                    }
                },
            },
            mounted(){
                this.configs = inisHelper.object.deep.merge(this.configs, this.config);
            },
            methods:{
                hasEmoji(el, config = {}, binding){
                    const cache = 'emoji'
                    // 本地存在缓存
                    if (inisHelper.has.session(cache)) {
                        this.emoji = inisHelper.get.session(cache)
                        setTimeout(() => {
                            this.initVditor(el, config)
                        }, 200)
                    }
                    // 不存在缓存，从服务器端获取
                    else this.initEmoji(el, config)
                    this.binding = binding
                },
                initEmoji(el, config = {}){
                    const cache = 'emoji'
                    Get('emoji').then((res) => {
                        if (res.code == 200) {
                            this.emoji = res.data
                            inisHelper.set.session(cache, res.data)
                            this.initVditor(el, config)
                        }
                    }).catch(err=>{
                        this.initEmoji(el, config)
                    })
                },
                // 初始化编辑器
                initVditor(el, config = {}){
                    let options = {
                        value: this.configs.content,
                        cdn: 'https://cdn.inis.cc/comm/libs/vditor',
                        height: 200,
                        minHeight: 200,
                        placeholder: this.configs.placeholder || '说点什么吧 (支持Mackdown语法！) * ... ... ',
                        mode: 'wysiwyg',
                        icon: 'material',           // 图标风格
                        toolbarConfig: {
                            pin: true,              // 固定工具栏
                        },
                        cache: {
                            enable: false,          // 关闭缓存
                        },
                        counter: {
                            enable: true,           // 启用计数器
                        },
                        resize: {
                            enable: true,           // 支持主窗口大小拖拽
                        },
                        preview: {
                            hljs: {
                                enable: true,       // 启用代码高亮
                                lineNumber: true,   // 启用行号
                            },
                            math: {
                                engine: 'MathJax',
                            }
                        },
                        // 编辑器异步渲染完成后的回调方法
                        after: () => {
                            this.show.vditor = true
                        },
                        // 快捷键
                        ctrlEnter: () => {
                            this.check()
                        },
                        hint: {
                            emoji: this.emoji,
                        },
                        upload: {
                            accept: 'image/*, video/*',
                            multiple: false,
                            // 上传失败自定义方法
                            handler: (files) => {

                                // window.vditor.tip('上传中...', 2000)
                                //
                                // let params = new FormData
                                // params.append('file', ...files)
                                // params.append('mode', 'file')
                                //
                                // axios.post('/admin/handle/upload', params, {
                                //     headers: {
                                //         "Content-Type": "multipart/form-data"
                                //     }
                                // }).then((res) => {
                                //     if (res.data.code == 200) {
                                //
                                //         let result = res.data.data
                                //         if (this.checkFile(result) == 'image') {
                                //             window.vditor.insertValue(`![](${result})`)
                                //         } else if (this.checkFile(result) == 'video') {
                                //             window.vditor.insertValue(`<video src="${result}" controls>Not Support</video>`)
                                //         } else {
                                //             window.vditor.insertValue(`${result}`)
                                //         }
                                //
                                //         window.vditor.tip('上传完成！', 2000)
                                //
                                //     } else {
                                //         window.vditor.tip(res.data.msg, 2000)
                                //     }
                                // })
                            },
                            filename: (name) => {
                                return name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, "")
                                    .replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, "")
                                    .replace("/\\s/g", "");
                            },
                        },
                        toolbar: [
                            "emoji","headings","bold","italic","strike","link",
                            "|",
                            "list","ordered-list","check","outdent","indent",
                            "|",
                            "quote","line","code","inline-code","insert-before","insert-after",
                            "|","table",
                            {
                                hotkey: "",
                                name: "album",
                                tipPosition: "s",
                                tip: "插入相册",
                                className: "right",
                                icon: `<img src='/assets/svg/album.svg' height="16">`,
                                click: () => {
                                    this.vditor.insertValue('[album]\n支持Markdown格式和HTML格式的图片\n[/album]')
                                }
                            },
                            "edit-mode","help",
                            "|",
                            "undo","redo",
                        ],
                    }
                    // 对象深度合并
                    config = inisHelper.object.deep.merge(options, config)
                    this.vditor   = new Vditor(el, config)
                    window.vditor = this.vditor
                },
                // 前置校验
                check(){
                    if (inisHelper.is.empty(this.vditor.getValue())) Notify('您可以说点什么哟~','warning')
                    else {
                        // 登录后评论
                        if (this.userInfo.login) this.send()
                        // 未登录评论
                        else Notify('请先登录！','warning')
                    }
                },
                // 发送评论
                send(){
                    // 加载中
                    this.is.load = true
                    this.$emit('finish', {
                        content: inisHelper.html2md(this.vditor.getHTML()),
                        binding: this.binding,
                    })
                },
                // 取消评论
                cancel(){
                    this.$emit('cancel', {
                        content: inisHelper.html2md(this.vditor.getHTML()),
                        binding: this.binding,
                    })
                },
                // 上下文
                context(){
                    return this
                },
                // 判断是否为空
                empty: (data) => inisHelper.is.empty(data),
            },
            directives: {
                vditor: {
                    // 初始化指令
                    mounted(el, binding) {
                        binding.instance.hasEmoji(el, {
                            height: inisHelper.is.mobile() ? 800 : 500,
                            minHeight: inisHelper.is.mobile() ? 800 : 500,
                        }, binding)
                    },
                    // 注销指令
                    unmounted(el, binding) {
                        window.vditor.destroy()
                    },
                }
            },
            computed: {
                userInfo(){
                    let result = {
                        data : {},
                        token: null,
                        login: false
                    }
                    if (inisHelper.has.cookie('LOGIN-TOKEN')) {
                        result = {
                            data : inisHelper.get.session('USER-INFO'),
                            token: inisHelper.get.cookie('LOGIN-TOKEN'),
                            login: true
                        }
                    } else result.login = false
                    return result
                }
            },
            template: `<div v-if="!show.vditor" class="flex-center">
                    <div class="spinner-border text-light m-2 wh-16px" role="status"></div>
                    Vditor 编辑器加载中 ... 
                </div>
                <div v-show="show.vditor" v-vditor></div>
                <div v-if="show.vditor" class="row pt-2">
                    <!-- 发表评论 -->
                    <div class="col-lg-12">
                        <button v-if="!is.load" v-on:click="check()" type="button" class="btn btn-outline-info btn-sm float-end">
                            <i class="mdi mdi-star-outline mdi-spin"></i> {{configs.text.send || '发表'}}
                        </button>
                        <button v-else type="button" class="btn btn-outline-info btn-sm float-end" disabled>
                            <div class="spinner-border text-light is-load me-1" role="status"></div> {{configs.text.load || '发送中 ...'}}
                        </button>
                        <button v-on:click="cancel()" type="button" class="btn btn-outline-danger btn-sm float-end me-2">取消</button>
                    </div>
                </div>`,
        }

    },
}

// 公共方法
const baseMethods = {
    // 浏览器底部位置
    scrollButtom: () => {
        // 客户端浏览器高度
        let clientHeight = 0
        if (document.body.clientHeight && document.documentElement.clientHeight) {
            clientHeight = document.body.clientHeight < document.documentElement.clientHeight ? document.body.clientHeight : document.documentElement.clientHeight
        } else {
            clientHeight = document.body.clientHeight > document.documentElement.clientHeight ? document.body.clientHeight : document.documentElement.clientHeight
        }
        let scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
        return scrollHeight - clientHeight
    }
}

// 监听混动条
window.onscroll = () => {
    // defer => 延迟单击事件 execute=>是否执行单击事件
    let [defer, execute] = [null, true]
    // 兼容方式获取滚动条Y坐标轴
    let y = window.pageYOffset !== undefined ?  window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const dom = document.querySelector('#back-to-top')
    dom.style.setProperty('display', y > 300 ? 'block' : 'none', 'important')
    // 单击事件
    dom.addEventListener('click',() => {
        execute = true
        defer = setTimeout(() => {
            if (execute) inisHelper.to.scroll(0)
        }, 150)
    })
    // 双击事件
    dom.addEventListener('dblclick',() => {
        // 清除单击事件
        clearTimeout(defer)
        execute = false
        inisHelper.to.scroll(baseMethods.scrollButtom())
    })
}
