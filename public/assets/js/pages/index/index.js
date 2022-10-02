(()=>{
    const app = Vue.createApp({
        data(){
            return {
                // 一言
                hitokoto: {
                    text: null,
                    load: false,
                },
                article: {
                    data: [],
                    page: 0,        // 总页码
                    count: 0
                },
                page: {
                    code: 1,        // 当前页码
                    load: false,
                    end: false,     // 最后一页
                },
                card: {
                    tips: 'placard',
                    title: null,
                    content: null,
                },
                password: {
                    id: 0, text: null,
                },
                onresize: $item.banner != 0 ? true : false,
            }
        },
        mounted(){
            this.getHitokoto()
            this.initArticle()
            this.hasPlacard()
            window.onresize = () => {
                if (this.onresize) this.cardAutoHigth()
                this.scale()
            }
        },
        methods: {
            // 初始化文章缓存
            initArticle(){
                const cache = 'article-config'
                // 从缓存中判断是否存在总页码
                if (!inisHelper.get.session(cache,'total_page')) {
                    Get('article',{
                        limit: 8
                    }).then(res=>{
                        if (res.code == 200) {
                            // 更新总页码
                            this.article.page = res.data.page
                            // 更新缓存总页码
                            inisHelper.set.session(cache,{total_page:res.data.page})
                        }
                    })
                } else this.article.page = inisHelper.get.session(cache, 'total_page')
            },
            // 检查本地缓存
            hasArticle(page = 1){
                // 只有一页，就不要获取API数据了 - 且 - 当前页码小于总页码
                if (this.article.page > 1 && this.page.code < this.article.page) {
                    // 页码自增一次
                    page = ++this.page.code
                    const cache = inisHelper.stringfy({api:'article',limit:8,page})
                    if (inisHelper.has.session(cache)) {
                        const article = inisHelper.get.session(cache)
                        this.article.data = [...this.article.data, ...article.data]
                    } else this.getArticle()
                } else this.page.end = true
            },
            // 获取文章数据
            getArticle(page = this.page.code){
                const cache = inisHelper.stringfy({api:'article',limit:8,page})
                const token = inisHelper.get.cookie('LOGIN-TOKEN')
                let config  = {}
                if (!this.empty(token)) config.headers = {Authorization: token}
                Get('article',{
                    limit: 8, page,
                }, config).then(res=>{
                    if (res.code == 200) {
                        this.article.data = [...this.article.data, ...res.data.data]
                        inisHelper.set.session(cache, res.data)
                    }
                })
            },
            // 检查本地缓存
            hasPlacard(){
                const cache = inisHelper.stringfy({api:'placard/sql',whereOr:'type,=,web;type,=,all;'})
                if (inisHelper.has.session(cache)) {
                    const placard = inisHelper.get.session(cache)
                    this.card = placard
                    this.card.tips = 'placard'
                } else this.getPlacard()
            },
            // 获取公告数据
            getPlacard(){
                const cahce = inisHelper.stringfy({api:'placard/sql',whereOr:'type,=,web;type,=,all;'})
                Get('placard/sql',{
                    whereOr: [
                        ['type', '=', 'web'],
                        ['type', '=', 'all'],
                    ],
                }).then(res=>{
                    if (res.code == 200 && res.data.count > 0) {
                        const result = res.data.data[0]
                        this.card = result
                        this.card.tips = 'placard'
                        inisHelper.set.session(cahce, result)
                    } else this.card.tips = 'site-info'
                })
            },
            // 获取一言数据
            getHitokoto(){
                this.hitokoto.load = true
                Get('file/words').then(res=>{
                    if (res.code == 200) {
                        this.hitokoto.text = res.data
                    }
                    this.hitokoto.load = false
                })
            },
            // 公告或站长信息自动高度
            cardAutoHigth(){
                const markCard = document.querySelector("#home-mark-card .card.first")
                const banner   = document.querySelector("#home-mark-banner .card-body")
                const second   = document.querySelector("#home-mark-card .card.second .card-body")
                const scroll   = document.querySelector("#home-mark-card .card.second .card-body .customize-scroll")
                const height = {
                    markCard:markCard.offsetHeight,
                    banner:banner.offsetHeight,
                    second:second.offsetHeight,
                    scroll:scroll.offsetHeight,
                }
                scroll.style.height = height.banner - height.markCard - height.second + height.scroll - 24 + 'px'
            },
            // 图片等比例缩放
            scale(){
                // 比例
                const scale = 16 / 9
                const images = document.querySelectorAll(".preview .article .img-cover")
                images.forEach(item=>{
                    const height = item.offsetWidth / scale
                    item.setAttribute('height', height)
                })
            },
            toPasswordArticle(){
                if (inisHelper.is.empty(this.password.text)) Notify('请输入密码', 'warning')
                else {
                    inisHelper.set.cookie('runtime-' + this.password.id, JSON.stringify(this.password.text))
                    window.location.href = `/article/${this.password.id}.html`
                }
            },
            // 路由跳转
            toRoute(url, auth = 'anyone', id = 0){
                if (auth == 'password') {
                    this.password.id = id
                    $('#article-auth-password').modal('show')
                } else window.location.href = url
            },
            // 自然时间
            nature(time = null,type = 5){
                return inisHelper.time.nature(time,type)
            },
            // 格式化数字
            format: (value = 0) => inisHelper.format.number(value),
            // 判断是否为空
            empty: (data = null) => inisHelper.is.empty(data),
        },
        updated(){
            if (this.onresize) this.cardAutoHigth()
            this.scale()
        },
    }).mount('#app')
})()