(()=>{
    const app = Vue.createApp({
        data(){
            return {
                article: {},
                password: {
                    id: 0, text: null,
                },
                hitokoto: {
                    text: null, load: false,
                },
                card: {
                    tips: 'placard',
                    title: null,
                    content: null,
                },
            }
        },
        mounted(){
            this.getHitokoto()
            this.hasArticle()
            this.hasPlacard()
            window.onresize = () => {
                this.scale()
                this.cardAutoHigth()
            }
        },
        methods: {
            hasArticle(){
                const cache = inisHelper.stringfy({api:'article', limit: 8, order: 'is_top desc, views desc'})
                if (inisHelper.has.session(cache)) {
                    this.article = inisHelper.get.session(cache)
                } else this.getArticle()
            },
            getArticle(){
                const cache = inisHelper.stringfy({api:'article', limit: 8, order: 'is_top desc, views desc'})
                const token = inisHelper.get.cookie('LOGIN-TOKEN')
                let config  = {}
                if (!this.empty(token)) config.headers = {Authorization: token}
                Get('article',{
                    limit: 8,
                    order: 'is_top desc, views desc'
                }, config).then(res=>{
                    if (res.code == 200) {
                        this.article = res.data.data
                        inisHelper.set.session(cache, res.data.data)
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
                    whereOr:'type,=,web;type,=,all;',
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
                const error    = document.querySelector("#home-mark-error .card-body")
                const second   = document.querySelector("#home-mark-card .card.second .card-body")
                const scroll   = document.querySelector("#home-mark-card .card.second .card-body .customize-scroll")
                const height = {
                    markCard:markCard.offsetHeight,
                    banner:error.offsetHeight,
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
            this.scale()
            this.cardAutoHigth()
        },
    }).mount('#app')
})()