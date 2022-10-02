(()=>{
    const app = Vue.createApp({
        data(){
            return {
                config: {
                    basic: {site: {copy:{}},style:{background:{},color:{},font:{}}},
                    developer: {code:{html:{}},footer:{},menu:{}},
                    other: {copy:{},help:{},images:{logo:{day:{},night:{}}},module:{},feature:{}}
                },
            }
        },
        mounted(){
            this.getConfig();
        },
        methods: {
            // 获取主题配置
            async getConfig() {
                const defaultConfig = await inisHelper.fetch.get('/assets/json/config.json')
                Get('options',{
                    key:'config:default-theme-beego'
                }).then(res=>{
                    if (res.code == 204) {
                        this.initConfig()
                    } else {
                        this.config = inisHelper.object.deep.merge(defaultConfig, res.data.opt)
                    }
                })
            },
            // 初始化主题配置
            async initConfig(){
                const defaultConfig = await inisHelper.fetch.get('/assets/json/config.json')
                await Put('options/save',{
                    keys: 'config:default-theme-beego',
                    opt: defaultConfig
                },{
                    headers: {
                        Authorization: inisHelper.get.cookie('LOGIN-TOKEN')
                    },
                }).then(res=>{
                    if (res.code == 200) {
                        this.config = inisHelper.object.deep.merge(this.config, defaultConfig)
                        inisHelper.set.session('theme-config-beego', this.config)
                        Notify('初始化主题配置成功', 'success')
                    } else {
                        Notify('初始化主题配置失败', 'error')
                    }
                })
            },
            // 保存主题配置
            saveConfig(){
                Post('options/save',{
                    keys: 'config:default-theme-beego',
                    opt: this.config
                },{
                    headers: {
                        Authorization: inisHelper.get.cookie('LOGIN-TOKEN')
                    },
                }).then(res=>{
                    if (res.code == 200) {
                        inisHelper.set.session('theme-config-beego', this.config)
                        Notify('保存主题配置成功', 'success')
                    } else {
                        Notify(res.msg, 'error')
                    }
                })
            },
        },
        computed: {

        },
        watch: {
            // config: {
            //     handler(val){
            //         console.log(this.config.other)
            //     },
            //     deep: true
            // }
        }
    }).mount('#app')
})()