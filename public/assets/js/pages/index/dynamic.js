(()=>{
    const app = Vue.createApp({
        data(){
            return {
                items: {
                    data: [],
                    page: 1,
                    count: 0,
                },
                page: {
                    code: 1,         // 当前页码
                    load: false,     // 是否正在加载
                    end : false,     // 最后一页
                },
                commentBox: {        // 评论框
                    id: 0,
                },
                likes: [],           // 点赞
                editId: 0,           // 编辑的评论id
                delId: 0,            // 删除的评论id
                hitokoto: {          // 当前一言
                    data: {},
                    load: false
                },
                count: {},           // 统计站内各项数据
                webmaster: {         // 站长信息
                    description: '',
                    gitee: "",
                    github: "",
                    qq: "",
                    wechat: "",
                    weibo: "",
                },
            }
        },
        components: {
            'comment-box': components.commentBox(),
        },
        mounted(){
            this.initData()
        },
        methods: {
            next: () => Notify('开发中，敬请期待'),
            // 初始化数据
            initData(){
                this.getComments()
                this.initDynamic()
                this.runHitokoto()
                this.getCount()
                this.getWebmaster()
            },
            // 初始化动态
            initDynamic(){
                if (inisHelper.has.storage('dynamic')) {
                    this.likes = inisHelper.get.storage('dynamic')?.like || []
                } else {
                    inisHelper.set.storage('dynamic', {like:[]})
                }
            },
            // 获取评论
            getComments(page = this.page.code){
                this.page.load = true
                if (!this.page.end) Get('comments/type', {
                    type: 'moving',
                    limit: 8, page, tree: false, order: 'create_time asc',
                }).then(res=>{
                    if (res.code == 200) {
                        const result     = res.data

                        this.items.page  = result.page
                        this.items.count = result.count
                        this.items.data  = [...this.items.data, ...result.data]

                        // 更新当前页码
                        this.page.code = page
                        // 最后一页
                        this.page.end  = this.page.code >= res.data.page ? true : false
                        // 加载完成
                        this.page.load = false
                    }
                })
            },
            // 发起一言请求
            runHitokoto(){
                this.hitokoto.load= true
                inisHelper.fetch.get('https://v1.hitokoto.cn').then(res=>{
                    this.hitokoto = {
                        data: res,
                        load: false
                    }
                }).catch(err=>{
                    this.runHitokoto()
                })
            },
            // 站内统计
            async getCount(){

                const group = await Get('group')
                if (group.code == 200) this.count = group.data

                const moving = await Get('comments/sql',{
                    where: [
                        ['type','=','moving']
                    ], limit: 1
                })

                if (moving.code == 200) this.count.moving = {
                    count: this.items.count,
                    comment: moving.data.count - this.items.count
                }
            },
            // 站长信息
            getWebmaster(){
                Get('options',{
                    key: 'webmaster'
                }).then(res=>{
                    if (res.code == 200) this.webmaster = res.data.opt
                })
            },
            // 评论完成
            finish(){
                this.items = {
                    data: [],
                    page: 1,
                    count: 0,
                }
                this.page = {
                    code: 1,
                    load: false,
                    end : false,
                }
                this.getComments()
                this.commentBox.id = 0
                this.editId = 0
            },
            // 取消评论
            cancel(){
                this.commentBox.id = 0
                this.editId = 0
            },
            // 删除评论
            deleteComment(id){
                Post('comments', {
                    id, mode: 'remove'
                },{
                    headers: this.userInfo.login ? {
                        Authorization: this.userInfo.token
                    } : {}
                }).then(res=>{
                    if (res.code == 200) {
                        // 删除本地评论
                        this.items.data = [...this.items.data.filter(item=>item.id != id)]
                        Notify('删除成功', 'success')
                        $('#dropdown-' + id).dropdown('hide')
                    } else {
                        Notify(res.msg, 'error')
                    }
                })
            },
            handle(type = 'edit', id = 0){
                if (type == 'edit') {
                    this.editId = id
                    this.delId  = 0
                    $('#dropdown-' + id).dropdown('hide')
                } else if (type == 'del') {
                    this.delId  = id
                } else if (type == 'share') {
                    $('#dropdown-' + id).dropdown('hide')
                    this.next()
                }
            },
            // 打开评论框
            openCommentBox(item = {}){
                if (!this.isLogin) Notify('请先登录', 'warning')
                else {
                    this.commentBox.id = item?.id || 0
                }
            },
            // 点赞
            like(id = null){
                if (id != null) {
                    if (!this.likes.includes(id)){
                        this.likes.push(id)
                        inisHelper.set.storage('dynamic', {like:this.likes})
                        Post('comments', {
                            id, mode: 'like',
                        }).then(res=>{
                            if (res.code == 200) {
                                Notify('点赞成功，爱你哟！', 'success')
                            }
                            this.getComments()
                        })
                    } else Notify('我知道您很喜欢这条评论，可是您已经点赞过了呀', 'info')
                }
            },
            // 自然时间
            nature: (date = null, type = 5) => inisHelper.time.nature(inisHelper.date.to.time(date), type),
            // 格式化数字
            format: (value = 0) => inisHelper.format.number(value),
            // 是否为空
            empty: (data) => inisHelper.is.empty(data),
        },
        // 计算属性
        computed: {
            // 是否登录
            isLogin: () => inisHelper.has.cookie('LOGIN-TOKEN'),
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
        directives: {
            highlight: {
                // 在base.js封装了公共方法
                mounted: (el) => directives.highlight(el)
            },
            imagebox: {
                // 在base.js封装了公共方法
                mounted: (el) => directives.imagebox(el)
            },
        },
    }).mount('#app')
})()