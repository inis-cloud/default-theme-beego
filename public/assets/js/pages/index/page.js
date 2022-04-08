(()=>{
    const app = Vue.createApp({
        data(){
            return {
                commentBox:{
                    // 页面名称
                    type: inisHelper.get.page.name().replace('.html','').replace('.htm','')
                },
                comments: {
                    data: [],
                    page: 0,        // 总页码
                    count: 0
                },
                page: {
                    code: 1,         // 当前页码
                    load: false,
                    end : false,     // 最后一页
                    list: [],
                },
                box: {
                    id: 0
                }
            }
        },
        mounted(){
            this.imagesBox()
            this.hasComment()
        },
        methods: {
            // 检查本地缓存
            hasComment(page = 1) {
                this.page.load = true
                const cache = inisHelper.stringfy({api: 'comments/type', type: this.commentBox.type, limit: 5, page})
                if (inisHelper.has.session(cache)) {
                    // 更新当前页码
                    this.page.code = page
                    const result   = inisHelper.get.session(cache)

                    this.comments.page  = result.page
                    this.comments.count = result.count
                    this.comments.data  = inisHelper.array.object.unique([...this.comments.data,...result.data],'id')

                    // 最后一页
                    this.page.end  = this.page.code >= result.page ? true : false
                    this.page.load = false
                } else this.getComment(page)
            },
            // 获取评论数据
            getComment(page = this.page.code) {
                const cache = inisHelper.stringfy({api: 'comments/type', type: this.commentBox.type, limit: 5, page})
                // 非最后一页获取数据
                if (!this.page.end) Get('comments/type', {
                    type: this.commentBox.type, limit: 5, page, tree: false
                }).then(res => {
                    if (res.code == 200) {
                        // 更新当前页码
                        this.page.code= page

                        this.comments.page  = res.data.page
                        this.comments.count = res.data.count
                        this.comments.data  = inisHelper.array.object.unique([...this.comments.data,...res.data.data], 'id')

                        inisHelper.set.session(cache, res.data)
                        // 最后一页
                        this.page.end = this.page.code >= res.data.page ? true : false
                        this.page.load= false
                    }
                })
            },
            // 图片
            imagesBox(){
                // 获取渲染文章下的全部图片
                const images = document.querySelector(".markdown").getElementsByTagName("img");
                for (let item of images) {
                    // 给图片上预览盒子
                    item.outerHTML = `<a data-fancybox="gallery" href="${item.src}" data-caption="${item.alt}">${item.outerHTML}</a>`
                }
            },
            // 设置评论框ID
            setBoxId(id = 0){
                this.box.id = id
                this.commentBox.pid = id
            },
            // 评论成功
            finish(){
                const cache = inisHelper.stringfy({api: 'comments/type', type: this.commentBox.type})
                // 清理评论相关缓存
                for (let item in sessionStorage.valueOf()) if (item.indexOf(cache) != -1) {
                    sessionStorage.removeItem(item)
                }
                this.box.id = 0
                // 更新评论
                this.getComment()
            },
            // 自然时间
            nature: (date = null,type = 5) => inisHelper.time.nature(inisHelper.date.to.time(date), type),
        },
        directives: {
            highlight: {
                // 在base.js封装了公共方法
                mounted: (el) => directives.highlight(el)
            }
        },
        components: {
            'comment-box': {
                data(){
                    return {
                        state: {
                            pid     : 0,
                            content : '',
                            nickname: '',
                            email   : '',
                            url     : '',
                        },
                        is: {
                            load : false,       // 加载中
                            login: false,       // 已登录
                        },
                    }
                },
                props: {
                    params: {type: Object, default:{}},
                    placeholder: {}
                },
                mounted(){

                },
                methods: {
                    send(){
                        const params = {...this.state, ...this.params}
                        if (inisHelper.is.empty(params.content))       Notify('您可以说点什么哟~','warning')
                        else if (inisHelper.is.empty(params.nickname)) Notify('你的名字为什么不愿意告诉我呢，好神秘啊~','warning')
                        else if (inisHelper.is.empty(params.email))    Notify('不写邮箱，是在拒绝我的回应吗？过分~','warning')
                        else if (!inisHelper.is.email(params.email))   Notify('给了个假邮箱，太坏了，哼~','warning')
                        else {
                            // 加载中
                            this.is.load = true
                            // 发送评论
                            Post('comments', params).then(res=>{
                                if (res.code == 200) {
                                    Notify('爱你哟！♥','success')
                                    this.$emit('finish')
                                    // 恢复默认数据
                                    this.state = {...this.state, ...{pid:0,content:''}}
                                } else Notify(res.msg,'error')
                                this.is.load = false
                            })
                        }
                    },
                    // 取消评论
                    cancel(){
                        this.$emit('cancel',0)
                    },
                    // 判断是否为空
                    empty: (data) => inisHelper.is.empty(data)
                },
                template: `<div class="row mx-0 w-100">
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <input v-model.trim="state.nickname" type="text" class="form-control customize-input" placeholder="昵称*：">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <input v-model.trim="state.email" type="text" class="form-control customize-input" placeholder="邮箱*：">
                        </div>
                    </div>
                    <div class="col-md-12">
                        <div class="form-group mb-3">
                            <input v-model.trim="state.url" type="text" class="form-control customize-input" placeholder="网址：">
                        </div>
                    </div>
                    <div class="col-md-12">
                        <div class="form-group mb-3">
                            <textarea v-model.trim="state.content" :placeholder="!empty(placeholder) ? placeholder : '说点什么吧 (支持markdown语法！) * ... ... '" class="form-control customize-textarea customize-scroll" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="col-md-12">
                        <button v-if="!is.load" v-on:click="send()" type="button" class="btn btn-outline-info btn-sm float-end">
                            <i class="mdi mdi-star-outline mdi-spin"></i> 发表评论
                        </button>
                        <button v-else type="button" class="btn btn-outline-info btn-sm float-end" disabled>
                            <div class="spinner-border text-light is-load me-1" role="status"></div> 发送中 ...
                        </button>
                        <button v-if="!empty(placeholder)" v-on:click="cancel()" type="button" class="btn btn-outline-danger btn-sm float-end me-2">取消</button>
                    </div>
                </div>`
            }
        },
    }).mount('#app')
})()