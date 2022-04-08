(()=>{
    const app = Vue.createApp({
        data(){
            return {
                sort: {},
                hitokoto: {
                    data: {},
                    load: false
                },
                search: {
                    page:{
                        page:1,
                        links:1,
                        article:1,
                        comments:1,
                    },
                    value: null,
                    init: false,
                    load: false,
                    result:{
                        article:{
                            page:1,
                            data:[],
                            count:0,
                        },
                        comments:{
                            page:1,
                            data:[],
                            count:0,
                        },
                        links:{
                            page:1,
                            data:[],
                            count:0,
                        },
                        page:{
                            page:1,
                            data:[],
                            count:0,
                        },
                    },
                    cloud: [],
                    local: [],
                }
            }
        },
        mounted(){
            this.hasSort()
            this.runHitokoto()
            this.hasCloudRecord()
            this.setLocal()
            this.search.value = inisHelper.get.query.string('value')
            this.runSearch()
        },
        methods: {
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
            // 检查本地缓存
            hasCloudRecord(){
                const cache = inisHelper.stringfy({api:'search/record', limit:99})
                if (inisHelper.has.session(cache)) {
                    const result = inisHelper.get.session(cache)
                    for (let i = 0; i < 20; i++) {
                        if (!inisHelper.is.empty(result[i]))
                            this.search.cloud.push(result[i])
                    }
                } else this.setCloudRecord()
            },
            // 获取数据
            setCloudRecord(){
                const cache = inisHelper.stringfy({api:'search/record', limit:99})
                Get('search/record',{
                    limit: 99
                }).then(res=>{
                    if (res.code == 200) {
                        const result = res.data.data
                        inisHelper.set.session(cache, result)
                        for (let i = 0; i < 20; i++) {
                            if (!inisHelper.is.empty(result[i]))
                                this.search.cloud.push(result[i])
                        }
                    }
                })
            },
            // 发起搜索
            runSearch(reset = false, page = {}, value = this.search.value){
                // 重组页码
                page = {...this.search.page, ...page}
                // 无刷URL
                if (history.pushState) history.pushState({}, 'search', '/search?value=' + (!this.empty(value) ? value : ''))
                if (inisHelper.is.empty(value)) this.search.init = false
                else {
                    // 设置搜索记录
                    this.setLocal(value)
                    this.search.value = value
                    this.search.load  = true
                    // 重置默认数据
                    if (reset) {
                        this.search.result = {
                            article:{page:1,data:[],count:0},
                            comments:{page:1,data:[],count:0},
                            links:{page:1,data:[],count:0},
                            page:{page:1,data:[],count:0},
                        }
                        page = {page:1,links:1,article:1,comments:1}
                    }
                    Get('search/complex',{
                        value,
                        config: {
                            article:{
                                page: page.article,
                                // sort_id: $('#search-select-sort').select2("data")[0].id,
                            },
                            comments:{
                                page: page.comments,
                            },
                            links:{
                                page: page.links
                            },
                            page:{
                                page: page.page
                            },
                            record:{
                                limit: 20
                            }
                        }
                    }).then(res=>{

                        if (res.code == 200) {

                            this.search.init = true
                            const result     = res.data
                            const allow      = ['article','comments','links','page']

                            for (let item in result) if (inisHelper.in.array(item, allow)) {
                                for (let i in result[item]) {
                                    // 更新各个数据中的 page 和 count
                                    if (i != 'data') this.search.result[item][i] = result[item][i]
                                    // push数据 - 数组对象数据去重
                                    else this.search.result[item].data = inisHelper.array.object.unique([
                                        ...this.search.result[item].data,
                                        ...result[item].data
                                    ])
                                }
                            }
                            this.search.cloud= result.record.data
                            this.search.load = false
                            this.search.page = this.empty(page) ? this.search.page : page

                        } else Notify(res.msg, 'error')
                    })
                }
            },
            // 设置搜索记录
            setLocal(value = ''){

                // 初始化搜索记录
                if (!inisHelper.get.storage('search','record')) inisHelper.set.storage('search',{record:[]})

                let array  = []
                let record = inisHelper.get.storage('search','record')
                // 对象转数组
                if (!inisHelper.is.empty(record)) for (let item in record) array.push(record[item])
                // push搜索记录
                if (!inisHelper.is.empty(value)) array.push(value)
                // 存储搜索记录 - 去重
                inisHelper.set.storage('search',{record:inisHelper.array.unique(array)})
                const result = inisHelper.get.storage('search','record')
                // 更新本地搜索记录
                this.search.local = result
                // 返回本地搜索记录
                return result
            },
            // 清除本地搜索记录
            clearLocal(){
                inisHelper.set.storage('search',{record:[]})
                this.search.local = []
            },
            // 路由跳转
            toRoute: url => window.location.href = url,
            // 自然时间
            nature: (date = null, type = 5) => inisHelper.time.nature(inisHelper.date.to.time(date), type),
            // 格式化数字
            format: (value = 0) => inisHelper.format.number(value),
            // 判断是否为空
            empty: (data = null) => inisHelper.is.empty(data),
        },
        watch: {
            sort: {
                handler(){
                    let data = [{id:'all',text:'全部'}]
                    if (!inisHelper.is.empty(this.sort.data)) {
                        let sort = this.sort.data.data
                        sort.map(item=>data.push({id:item.id,text:item.name}))
                    }
                    $('#search-select-sort').select2({
                        minimumResultsForSearch: Infinity, data
                    })
                },
                deep: true
            }
        },
        directives: {
            highlight: {
                // 在base.js封装了公共方法
                mounted: (el) => directives.highlight(el)
            }
        }
    }).mount('#app')
})()