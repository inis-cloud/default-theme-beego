(()=>{
    const app = Vue.createApp({
        data(){
            return {
                isEdit: false,
                config: {
                    content: '',
                    text: {
                        send: '保存',
                        load: '保存中 ...'
                    },
                    placeholder: '请书写您的爱情故事！'
                },
                item: {
                    alias:'lovers',
                    title:'情侣空间',
                    content: '请书写您的爱情故事！',
                    opt: {
                        boy: {
                            avatar: 'https://q.qlogo.cn/g?b=qq&nk=97783391&s=640',
                            nickname: '兔子',
                        },
                        girl: {
                            avatar: 'https://q.qlogo.cn/g?b=qq&nk=97783390&s=640',
                            nickname: '胡萝卜',
                        },
                        cover: {
                            image: 'https://api.inis.cn/api/file/random?id=1',
                            video: 'https://cdn.inis.cc/comm/video/swear-by-hook.mp4',
                            type: 'image'
                        },
                        title: {
                            first: '祝福',
                            second: '我们的故事',
                        },
                        placard: '我希望有一天，能挽着你的手，去敬各位来宾的酒。\n<!-- 动态背景 - 开始 -->\n' +
                            '<script src="https://cdn.inis.cc/theme/default/assets/js/bg/8.js"></script>\n' +
                            '<!-- 动态背景 - 结束 -->',
                        loveStartTime: '2020-5-20',
                    },
                },
                page: {
                    code: 1,         // 当前页码
                    load: false,     // 是否正在加载
                    end : false,     // 最后一页
                },
                bless: {             // 祝福
                    data: [],
                    page: 1,
                    count: 0,
                },
                hitokoto: {          // 当前一言
                    data: {},
                    load: false
                },
                upload: {
                    el: '#cover-input',
                    loading: false,
                },
                time: {
                    date: '',
                    first: '时间为媒',
                    second: '余生为聘',
                    array: [
                        {first: '时间为媒', second: '余生为聘'},
                        {first: '以你之名', second: '冠我之姓'},
                        {first: '执子之手', second: '与子偕老'},
                        {first: '始于初见', second: '至于终老'},
                    ],
                },
                videoMuted: true,
            }
        },
        mounted() {
            this.initData()
        },
        components: {
            'comment-box': components.commentBox(),
            'vditor-box': components.vditorBox(),
        },
        methods: {
            // 初始化数据
            initData(){
                this.hasLovers()
                this.getBless()
                this.runHitokoto()
                let index = 0
                setInterval(()=>{
                    index = index == this.time.array.length - 1 ? 0 : index + 1
                    this.time.first  = this.time.array[index]?.first
                    this.time.second = this.time.array[index]?.second
                }, 2000)
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
            // 是否已经存在了情侣空间这个页面
            hasLovers(){
                Get('page',{
                    alias:'lovers', mode: 'md',
                }).then(res=>{
                    // 如果页面不存在，则创建
                    if (res.code == 204) {
                        // 判断是否已经登录，且拥有权限
                        if (this.userInfo.login == true && this.userInfo.data.level == 'admin') {
                            this.saveLovers()
                        }
                    } else if (res.code == 200) {
                        this.item = res.data
                        setInterval(()=>{
                            let [time, days, date] = ['', this.days, new Date()]
                            if (days >= 365) {
                                time += Math.floor(days / 365) + '年'
                            }
                            if (days % 365 >= 30) {
                                time += Math.floor(days % 365 / 30) + '月'
                            }
                            if (days % 30 >= 1) {
                                time += Math.floor(days % 30) + '天'
                            }

                            time += date.getHours() + '小时'
                            time += date.getMinutes() + '分钟'
                            time += date.getSeconds() + '秒'

                            this.time.date = time
                        })
                        this.config.content = res.data.content
                    }
                })
            },
            // 创建情侣空间页面
            saveLovers(init = true, params = this.item){
                Post('page', params,{
                    headers: {
                        Authorization: this.userInfo.token
                    }
                }).then(res=>{
                    if (res.code == 200) {
                        if (init) {
                            Notify('页面初始化完成，即将刷新当前页面', 'success')
                            setTimeout(()=>{
                                window.location.reload()
                            },1500)
                        } Notify('保存成功！部分内容需要刷新页面生效', 'success')
                    } else Notify(res.msg, 'error')
                })
            },
            // 页面编辑完成
            finish(result){
                // 保存内容
                Post('page',{
                    ...this.item,
                    content: result.content
                },{
                    headers: {
                        Authorization: this.userInfo.token
                    }
                }).then(res=>{
                    if (res.code == 200) {
                        this.isEdit = false
                        setTimeout(()=>{
                            window.location.reload()
                        },200)
                    } else Notify(res.msg, 'error')
                    // 结束加载
                    result.binding.instance.context().is.load = false
                })
            },
            // 取消编辑页面
            cancel(){
                this.isEdit = false
            },
            // 获取祝福
            getBless(page = this.page.code){
                this.page.load = true
                if (!this.page.end) Get('comments/type', {
                    type: 'lovers',
                    limit: 8, page, tree: false, order: 'create_time asc',
                }).then(res=>{
                    if (res.code == 200) {
                        const result     = res.data

                        this.bless.page  = result.page
                        this.bless.count = result.count
                        this.bless.data  = [...this.bless.data, ...result.data]

                        // 更新当前页码
                        this.page.code = page
                        // 最后一页
                        this.page.end  = this.page.code >= res.data.page ? true : false
                        // 加载完成
                        this.page.load = false
                    }
                })
            },
            // 送祝福完成
            blessFinish(){
                this.bless = {
                    data: [],
                    page: 1,
                    count: 0,
                }
                this.page = {
                    code: 1,
                    load: false,
                    end : false,
                }
                this.getBless()
            },
            // 触发上传封面
            uploadFile(el = '#cover-input'){
                this.upload.el = el
                document.querySelector(el).click()
            },
            // 上传
            uploadChange(e, el = this.upload.el){

                this.upload.loading = true

                Post('file', {
                    mode: 'upload', file: e.target.files[0],
                },{
                    headers: {
                        Authorization : this.userInfo.token,
                        "Content-Type": "multipart/form-data"
                    },
                }).then(res=>{
                    if (res.code == 200) {

                        if (el == '#cover-input' || el == '#lovers-upload-image-cover') {
                            this.item.opt.cover.image = res.data
                        } else if (el == '#lovers-upload-boy-avatar') {
                            this.item.opt.boy.avatar  = res.data
                        } else if (el == '#lovers-upload-girl-avatar') {
                            this.item.opt.girl.avatar = res.data
                        } else if (el == '#lovers-upload-video-cover') {
                            this.item.opt.cover.video = res.data
                        }
                        this.saveLovers(false)
                    } else Notify(res.msg, 'error')
                    e.target.value = ''
                    this.upload.loading = false
                })
            },
            // 视频静音
            muted(bool = true){
                this.videoMuted = bool
                let video   = document.querySelector('#video')
                video.muted = bool
                // 调整音量
                if (!bool) video.volume = 0.5
            },
            // 自然时间
            nature: (date = null, type = 5) => inisHelper.time.nature(inisHelper.date.to.time(date), type),
            // 格式化数字
            format: (value = 0) => inisHelper.format.number(value),
            // 是否为空
            empty: (data) => inisHelper.is.empty(data),
        },
        computed: {
            // 是否登录
            isLogin: () => inisHelper.has.cookie('LOGIN-TOKEN'),
            userInfo(){
                let result = {
                    data : {
                        level: 'user',
                    },
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
            },
            // 计算我们成为情侣至今的天数
            days(){
                let date = new Date()
                let now  = date.getTime()
                let end  = new Date(this.item.opt.loveStartTime || date.getTime()).getTime()
                return Math.floor((now - end) / (1000 * 60 * 60 * 24))
            },
            // 今天的小时，分钟，秒
            time(){
                let date = new Date()
                return {
                    hour: date.getHours(),
                    minute: date.getMinutes(),
                    second: date.getSeconds()
                }
            },
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
        watch: {
            item: {
                handler: function(){
                    if (this.item.opt.cover.type == 'image') {
                        this.videoMuted = true
                    }
                },
                deep: true
            }
        }
    }).mount('#app');
})()