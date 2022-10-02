!function (t) {

    // 左侧边栏
    const leifSite = Vue.createApp({
        data() {
            return {
                // 默认数据
                config: {
                    "basic": {
                        "site": {
                            "title"       :  null,
                            "favicon"     :  null,
                            "nickname"    :  null,
                            "description" :  null,
                            "head_img"    :  null,
                            "present"     :  null,
                            "copy"		  :	 {
                                "code":null,
                                "url" :null
                            }
                        },
                        "style": {
                            "color":{
                                "nav":null,
                                "left":null,
                                "main":null,
                                "background":null
                            },
                            "opacity":null,
                            "background":{
                                "static":null,
                                "dynamic":null
                            },
                            "font":{
                                "color":null,
                                "size":null
                            },
                            "radius":null
                        }
                    },
                    "other": {
                        "module":{
                            "banner"	  :  false,
                            "article_copy":  false,
                            "music"       :  false,
                            "wecome"      :  false,
                            "login"       :  false,
                            "placard"     :  false
                        },
                        "images":  {
                            "preview_url": null,
                            "img_err_url": null,
                            "cross_bg"   : null,
                            "logo": {
                                "day": {
                                    "big":null,
                                    "small":null
                                },
                                "night":{
                                    "big":null,
                                    "small":null
                                }
                            }
                        },
                        "help": {
                            "description" :  null,
                            "btn_text"    :  null,
                            "btn_url"     :  null,
                            "img_src"     :  null,
                            "is_show"     :  false
                        },
                        "copy": {
                            "text"        :  null
                        }
                    },
                    "developer": {
                        "code": {
                            "css"         :  null,
                            "html"        : {
                                "head"    : null,
                                "body"    : null
                            }
                        },
                        "menu": {
                            "one": null,
                            "two": null
                        },
                        "footer": {
                            "left"        :  null,
                            "right":null
                        }
                    }
                },
                // 自定义菜单
                menu: {
                    one: {
                        data : [],
                        check: true
                    },
                    two: {
                        data : [],
                        check: true
                    },
                },
                // 文章分类
                sort: {
                    data: [],
                    show: false
                },
                // 页面数据
                page: {
                    data: [],
                    show: false
                },
                // 友链
                link: {
                    data: [],
                    show: false
                },
                // 需要被排除的页面
                exclude: ['lovers'],
            }
        },
        mounted() {
            this.initData()
        },
        methods: {
            // 初始化本地配置
            initData(){
                this.hasConfig()
                this.hasSort()
                this.hasPage()
                this.hasLink()
            },
            // 检查本地缓存
            async hasConfig(){
                const cache = 'theme-config-beego'
                const defaultConfig = await inisHelper.fetch.get('/assets/json/config.json')
                // 本地存在缓存
                if (inisHelper.has.session(cache)) {
                    this.config = inisHelper.object.deep.merge(defaultConfig, inisHelper.get.session(cache))
                    // 设置菜单信息
                    this.setMenu()
                    this.setCode()
                }
                // 不存在缓存，从服务器端获取
                else this.getConfig()
            },
            // 获取服务器配置
            async getConfig(){
                const defaultConfig = await inisHelper.fetch.get('/assets/json/config.json')
                Get('options',{
                    key:'config:default-theme-beego'
                }).then(res=>{
                    if (res.code == 200) {
                        const result = res.data.opt
                        this.config  = inisHelper.object.deep.merge(defaultConfig, result)
                        inisHelper.set.session('theme-config-beego',result)
                    } else this.getDefaultConfig()
                    // 设置菜单信息
                    this.setMenu()
                    this.setCode()
                })
            },
            // 获取本地默认配置
            getDefaultConfig(){
                inisHelper.fetch.get('/assets/json/config.json').then(res=>{
                    this.config = res
                    inisHelper.set.session('theme-config-beego',res)
                })
            },
            // 设置菜单信息
            setMenu(){
                try {
                    const one = this.config.developer.menu.one
                    this.menu.one.data  = inisHelper.is.empty(one) ? [] : JSON.parse(one)
                } catch (err){
                    this.menu.one.check = false
                }
                try {
                    const two = this.config.developer.menu.two
                    this.menu.two.data  = inisHelper.is.empty(two) ? [] : JSON.parse(two)
                } catch (err){
                    this.menu.two.check = false
                }
            },
            // 设置自定义代码
            setCode(){
                $('head').append(`<style>${this.config.developer.code.css}</style>`)
                $('body').append(`<script>(()=>{${this.config.developer.code.js}})()</script>`)
            },
            // 检查本地缓存
            hasSort(){
                const cache = 'article-sort'
                // 本地存在缓存
                if (inisHelper.has.session(cache)) {
                    this.sort = inisHelper.get.session(cache)
                }
                // 不存在缓存，从服务器端获取
                else this.getSort()
            },
            // 获取文章分类
            getSort(){
                Get('article-sort',{
                    limit: 99
                }).then(res=>{
                    if (res.code == 200) {
                        this.sort = {
                            show: res.data.count != 0 ? true : false,
                            data: res.data
                        }
                        // 设置缓存
                        inisHelper.set.session('article-sort', this.sort)
                    }

                })
            },
            // 检查本地缓存
            hasPage(){
                const cache = 'page-list'
                // 本地存在缓存
                if (inisHelper.has.session(cache)) {
                    this.page = inisHelper.get.session(cache)
                }
                // 不存在缓存，从服务器端获取
                else this.getPage()
            },
            // 获取页面
            getPage(){
                Get('page',{
                    limit: 99
                }).then(res=>{
                    if (res.code == 200) {
                        this.page = {
                            show: res.data.count != 0 ? true : false,
                            data: res.data
                        }
                        // 设置缓存
                        inisHelper.set.session('page-list', this.page)
                    }
                })
            },
            // 检查本地缓存
            hasLink(){
                const cache = 'first-link'
                // 本地存在缓存
                if (inisHelper.has.session(cache)) {
                    this.link = inisHelper.get.session(cache)
                }
                // 不存在缓存，从服务器端获取
                else this.getLink()
            },
            // 获取友链
            async getLink(){

                let id = null
                // 先获取友链分类数据，得到第一个分类为全局友链
                let sort   = await Get('links-sort',{
                    limit:1, order:"create_time asc, id asc"
                })
                if (sort.code == 200) if (sort.data.count != 0) id = sort.data.data[0].id

                // 存在一个以上的分类
                if (!this.empty(id)) {
                    await Get('links-sort',{
                        id, limit: 999
                    }).then(res=>{
                        if (res.code == 200) {
                            this.link = {
                                data: res.data.expand,
                                show: res.data.expand.count != 0 ? true : false
                            }
                            inisHelper.set.session('first-link', this.link)
                        }
                    })
                }
                // 没定义友链分类
                else {
                    await Get('links',{
                        limit: 999
                    }).then(res=>{
                        if (res.code == 200) {
                            this.link = {
                                data: res.data,
                                show: res.data.count != 0 ? true : false
                            }
                            inisHelper.set.session('first-link', this.link)
                        }
                    })
                }
            },
            level(level = 'user'){
                let result = false
                const info = inisHelper.get.session('USER-INFO')
                if (this.empty(info) || this.empty(info?.level)) result = false
                else result = info.level == level
                return result
            },
            // 判断是否为空
            empty(data = null){
                return inisHelper.is.empty(data)
            },
            // 判断是否True
            isTrue: (data = null) => inisHelper.is.true(data),
        },
        watch: {

        }
    }).mount('#left-side')

    // 顶部导航栏
    const nav = Vue.createApp({
        data(){
            return {
                search: {
                    placeholder: null,
                    data: [],
                },
                searchValue: '',
                load: {
                    login: false,
                },
                account: null,
                password: null,
                user: {
                    isLogin: false,
                    info: {},
                },
                updateInfo: {},
            }
        },
        mounted() {
            this.update()
            this.lottieEmail()
            this.initSearch()
        },
        methods: {
            next: () => Notify('开发中，敬请期待'),
            // 初始化搜索
            initSearch(){
                this.hasSearch()
                this.hasSearchRecord()
            },
            // 检查本地缓存
            hasSearch(){
                const cache = inisHelper.stringfy({api:'search', limit:8})
                if (inisHelper.has.session(cache)) {
                    this.search.data = inisHelper.get.session(cache)
                } else this.getSearch()
            },
            // 获取数据
            getSearch(){
                const cache = inisHelper.stringfy({api:'search', limit:8})
                Get('search',{
                    limit: 8
                }).then(res=>{
                    if (res.code == 200) {
                        const result = res.data.data
                        this.search.data = result
                        inisHelper.set.session(cache, result)
                    }
                })
            },
            // 检查本地缓存
            hasSearchRecord(){
                const cache = inisHelper.stringfy({api:'search/record', limit:99})
                if (inisHelper.has.session(cache)) {
                    const result = inisHelper.object.to.array(inisHelper.get.session(cache))
                    if (result.length >= 1) {
                        const random = inisHelper.get.random.num(1, result.length)
                        this.search.placeholder = result[random]?.name
                    }
                } else this.setSearchRecord()
            },
            // 获取数据
            setSearchRecord(){
                const cache = inisHelper.stringfy({api:'search/record', limit:99})
                Get('search/record',{
                    limit: 99
                }).then(res=>{
                    if (res.code == 200) {
                        const result = res.data.data
                        inisHelper.set.session(cache, result)
                        if (result.length >= 1) {
                            const random = inisHelper.get.random.num(1, result.length)
                            this.search.placeholder = result[random]?.name
                        }
                    }
                })
            },
            // 登录
            login(){
                if (inisHelper.is.empty(this.account)) Notify('请输入账号', 'warning')
                else if (inisHelper.is.empty(this.password)) Notify('请输入密码', 'warning')
                else {
                    this.load.login = true
                    Post('users',{
                        mode: 'login',
                        account: this.account,
                        password: this.password
                    }).then(res=>{
                        this.load.login = false
                        if (res.code == 200) {
                            Notify('登录成功', 'success')
                            $('#login-modal').modal('hide')
                            inisHelper.set.cookie('LOGIN-TOKEN', res.data['login-token'], 7200)
                            this.user = {
                                isLogin: true,
                                info: res.data.user,
                            }
                            inisHelper.set.session('USER-INFO', res.data.user)
                            // 刷新当前页面
                            window.location.reload()
                        } else Notify(res.msg, 'warning')
                    })
                }
            },
            // 校验登录
            isLogin: () => inisHelper.has.cookie('LOGIN-TOKEN'),
            // 校验登录
            checkLogin(){
                if (this.isLogin()){
                    Post('users',{
                        mode: 'check',
                        Authorization: inisHelper.get.cookie('LOGIN-TOKEN')
                    }).then(res=>{
                        if (res.code == 200) {
                            this.user.isLogin = true
                            this.user.info = res.data
                            inisHelper.set.session('USER-INFO', res.data)
                        } else {
                            this.user.isLogin = false
                            this.user.info = {}
                            inisHelper.clear.cookie('LOGIN-TOKEN')
                            inisHelper.cleae.session('USER-INFO')
                            Notify('登录已过期，请重新登录', 'warning')
                            // 刷新当前页面
                            window.location.reload()
                        }
                    })
                }
            },
            // 退出登录
            logout(){
                this.user.isLogin = false
                this.user.info = {}
                setTimeout(()=>{
                    inisHelper.fetch.delete('/api/cookie')
                    inisHelper.clear.cookie('LOGIN-TOKEN')
                    inisHelper.clear.session('USER-INFO')
                    // 刷新当前页面
                    window.location.reload()
                }, 500)
                Notify('退出登录成功', 'success')
            },
            // 检查更新
            update(){
                inisHelper.fetch.get('https://inis.cc/api/theme',{
                    id: 6
                }).then(res=>{
                    if (res.code == 200) {
                        this.updateInfo = res.data.opt
                        this.updateInfo.last_update_time = inisHelper.time.nature(res.data.last_update_time)
                        if (inisHelper.compare.version(this.updateInfo.version, INIS.version)) {
                            this.lottieUpdate()
                        }
                    }
                })
            },
            lottieUpdate(){
                inisHelper.fetch.get('/assets/libs/lottie/json/beil.json').then(res=>{
                    // 先删除动态图标
                    document.querySelector('#lottie-beil').innerHTML = ''
                    // 更新动态图标
                    lottie.loadAnimation({container:document.getElementById("lottie-beil"),renderer:"svg",loop:true,autoplay:true,animationData:res})
                })
            },
            lottieEmail(){
                inisHelper.fetch.get('/assets/libs/lottie/json/mail.json').then(res=>{
                    // 先删除动态图标
                    document.querySelector('#lottie-email').innerHTML = ''
                    // 更新动态图标
                    lottie.loadAnimation({container:document.getElementById("lottie-email"),renderer:"svg",loop:true,autoplay:true,animationData:res})
                })
            },
            // 路由跳转
            toRoute(){
                const value = inisHelper.is.empty(this.searchValue) ? this.search.placeholder : this.searchValue
                window.location.href = '/search?value=' + value
            },
            // 链接跳转
            toUrl: (url) => window.open(url),
            // 是否为空
            empty: (data) => inisHelper.is.empty(data)
        },
        computed: {

        },
        watch: {
            searchValue: {
                handler(newValue, oldValue){

                    if (!inisHelper.is.empty(this.searchValue)) {
                        Get('search/article',{
                            limit: 8, value: this.searchValue, record: false
                        }).then(res=>{
                            if (res.code == 200) {
                                this.search.data = res.data.data
                            }
                        })
                    }

                    // 搜索被删除，回到初始状态
                    if (!inisHelper.is.empty(oldValue) && inisHelper.is.empty(newValue)) this.hasSearch()
                },
            },
            user: {
                handler(){
                    if (!inisHelper.has.session('USER-INFO')) {
                        this.checkLogin()
                    } else if (this.isLogin()) {
                        this.user.isLogin = true
                        this.user.info = inisHelper.get.session('USER-INFO')
                    }
                },
                // deep: true,
                immediate: true,
            }
        }
    }).mount('#nav')

    // 页脚
    const footer = Vue.createApp({
        data(){
            return {

            }
        },
        mounted(){

        },
        methods: {

        }
    }).mount('#footer')

    // 自定义UI
    const setting= Vue.createApp({
        data(){
            return {
                config: {
                    mode: {
                        theme: 'light',   // light, dark
                        leftbar: 'fixed', // fixed, condensed
                    }
                },
                storage:{
                    session:{
                        length: sessionStorage?.length || 0,
                    }
                }
            }
        },
        mounted(){
            leifSite.hasConfig()
            this.initData()
        },
        methods: {
            // 初始化方法
            initData(){
                // 初始化本地配置
                if (!inisHelper.has.storage('config')) inisHelper.set.storage('config', this.config)
                // 导入本地配置
                this.config = inisHelper.get.storage('config')
            },
            // 重置配置
            reset(){
                inisHelper.set.storage('config', {
                    mode: {
                        theme: 'light',   // light, dark
                        leftbar: 'fixed', // fixed, condensed
                    }
                })
                this.initData()
            },
            // 清理本地缓存
            clearStorage(){
                sessionStorage.clear()
                this.storage.session.length = sessionStorage?.length || 0
            },
        },
        computed: {

        },
        watch: {
            config: {
                handler(){

                    const self = this
                    const body = document.querySelector('body')
                    const mode = self.config.mode
                    // logo dom
                    const logoLg = document.querySelector('.topnav-logo-lg img')
                    const logoSm = document.querySelector('.topnav-logo-sm img')
                    const login  = document.querySelector('#login-modal .modal-header .flex-center img')
                    // 主题配置
                    const config = inisHelper.get.session('theme-config-beego')

                    // 夜间模式
                    if (mode.theme == 'dark') {
                        body.setAttribute('data-theme-mode', 'dark')
                        inisHelper.set.links('/assets/css/app-modern-dark.min.css', 'link')
                        // 切换logo
                        logoLg.setAttribute('src', config?.other?.images?.logo?.night?.big || '/assets/images/logo_night.png')
                        logoSm.setAttribute('src', config?.other?.images?.logo?.night?.small || '/assets/images/logo_sm.png')
                        login.setAttribute('src', config?.other?.images?.login?.night?.big || '/assets/images/logo_night.png')
                    } else {
                        const links = document.querySelectorAll('link[rel=stylesheet]')
                        links.forEach((item)=> {
                            if (item.getAttribute('href') == '/assets/css/app-modern-dark.min.css') item.remove()
                        })
                        body.setAttribute('data-theme-mode', 'light')
                        // 切换logo
                        logoLg.setAttribute('src', config?.other?.images?.logo?.day?.big || '/assets/images/logo.png')
                        logoSm.setAttribute('src', config?.other?.images?.logo?.day?.small || '/assets/images/logo_sm.png')
                        login.setAttribute('src', config?.other?.images?.login?.day?.big || '/assets/images/logo.png')
                    }

                    body.setAttribute('data-leftbar-compact-mode', mode.leftbar)

                    inisHelper.set.storage('config', self.config)
                },
                deep: true,
            },
        }
    }).mount('#setting')

    console.log("%cinis系统默认主题，beego开发服务器渲染版本%cversion - " + INIS.version,
        "color:white;background:#313a46;padding:3px 7px;border-top-left-radius: 3px;border-bottom-left-radius: 3px;",
        "color:white;background:#727cf5;padding:3px 7px;border-top-right-radius: 3px;border-bottom-right-radius: 3px;"
    )

}(window.jQuery)