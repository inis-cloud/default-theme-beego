(()=>{
    const app = Vue.createApp({
        data(){
            return {
                sortList: {
                    show: false,
                    data: []
                },
                tagList: {
                    data: false,
                    data: []
                },
                state: {
                    name: decodeURI(inisHelper.get.page.name()),   // 当前页面名称：page name
                    type: 'sort',                       // 当前页面属性：tag or sort
                    order: {
                        index: 1,
                        value: 'create_time desc',      // 排序方式：self page data order
                    }
                },
                self: {
                    limit:6,         // 切片：self page data slice
                    data: {},        // 页面数据：self page data
                    page: {
                        code: 1,     // 当前页码：self page code
                        end: false,  // 最后一页：self is end page?
                    },
                    cover: false,    // 覆盖Go渲染的数据：cover go render page data?
                    loading: false,  // 加载中：self page data is loading?
                }
            }
        },
        mounted(){
            this.hasSortList()
            this.hasTagList()
        },
        methods: {
            // 检查本地缓存
            hasSortList(){
                const cache = 'article-sort-list'
                // 本地存在缓存
                if (inisHelper.has.session(cache)) {
                    this.sortList = inisHelper.get.session(cache)
                }
                // 不存在缓存，从服务器端获取
                else this.getSortList()
            },
            // 获取文章分类列表
            getSortList(){
                Get('article-sort',{
                    limit: 99
                }).then(res=>{
                    if (res.code == 200) {
                        this.sortList = {
                            show: res.data.count != 0 ? true : false,
                            data: res.data
                        }
                        // 设置缓存
                        inisHelper.set.session('article-sort-list', this.sortList)
                    }
                })
            },
            // 检查本地缓存
            hasTagList(){
                const cache = 'tag-list'
                // 本地存在缓存
                if (inisHelper.has.session(cache)) {
                    this.tagList = inisHelper.get.session(cache)
                }
                // 不存在缓存，从服务器端获取
                else this.getTagList()
            },
            // 获取标签列表
            getTagList(){
                Get('tag',{
                    limit: 99
                }).then(res=>{
                    if (res.code == 200) {
                        this.tagList = {
                            show: res.data.count != 0 ? true : false,
                            data: res.data
                        }
                        // 设置缓存
                        inisHelper.set.session('tag-list', this.tagList)
                    }
                })
            },
            // 设置排序方式
            setOrder(order = this.state.order.value, index = this.state.order.index){
                this.state.order = {value: order, index}
                if (this.state.type == 'sort') this.hasSort()
                else this.hasTag()
            },
            // 检查本地缓存
            hasSort(clear = false, name = null, page = 1, order = this.state.order.value) {
                this.self.loading = true
                // 当前页面数据恢复默认值
                if (clear) this.self = {...this.self, ...{data:{},page:{code:1,end:false}}}
                // name为空，则从页面中获取
                name = inisHelper.is.empty(name) ? decodeURI(inisHelper.get.page.name()) : name

                this.state.name = name
                this.state.type = 'sort'

                // 缓存名称
                const cache = inisHelper.stringfy({api: 'article-sort', name, limit: this.self.limit, page, order})
                if (inisHelper.has.session(cache)) {
                    // 更新当前页码
                    this.self.page.code = page
                    const result = inisHelper.get.session(cache)
                    this.self.data      = result
                    // 最后一页
                    this.self.page.end  = this.self.page.code >=  result.expand.page ? true : false
                    // 无刷URL
                    if (history.pushState) history.pushState({}, name, '/' + this.state.type + '/' + this.state.name)
                    // 显示Vue加载的数据
                    if (!this.self.cover) this.self.cover = true
                    this.self.loading = false
                } else this.getSort(name,page,order)
            },
            // 获取分类下的文章数据
            async getSort(name = null, page = this.self.page.code, order = this.state.order.value) {

                this.state.name = name
                this.state.type = 'sort'

                // 缓存名称
                const cache = inisHelper.stringfy({api: 'article-sort', name, limit: this.self.limit, page, order})
                // 非最后一页获取数据
                if (!this.self.page.end) await Get('article-sort', {
                    name, page, order, limit: this.self.limit
                }).then(res => {
                    if (res.code == 200) {
                        // 更新当前页码
                        this.self.page.code= page
                        this.self.data     = res.data
                        inisHelper.set.session(cache, res.data)
                        // 最后一页
                        this.self.page.end = this.self.page.code >= res.data.expand.page ? true : false
                        // 无刷URL
                        if (history.pushState) history.pushState({}, name, '/' + this.state.type + '/' + this.state.name)
                        // 显示Vue加载的数据
                        if (!this.self.cover) this.self.cover = true
                        this.self.loading = false
                    }
                })
            },
            // 检查本地缓存
            hasTag(clear = false, name = null, page = 1, order = this.state.order.value) {
                this.self.loading = true
                // 当前页面数据恢复默认值
                if (clear) this.self = {...this.self, ...{data:{},page:{code:1,end:false}}}

                // name为空，则从页面中获取
                name = inisHelper.is.empty(name) ? decodeURI(inisHelper.get.page.name()) : name

                this.state.name = name
                this.state.type = 'tag'

                // 缓存名称
                const cache = inisHelper.stringfy({api: 'article-tag', name, limit: this.self.limit, page, order})
                if (inisHelper.has.session(cache)) {
                    // 更新当前页码
                    this.self.page.code = page
                    const result        = inisHelper.get.session(cache)
                    this.self.data      = result
                    // 最后一页
                    this.self.page.end  = this.self.page.code >= result.expand.page ? true : false
                    // 无刷URL
                    if (history.pushState) history.pushState({}, name, '/' + this.state.type + '/' + this.state.name)
                    // 显示Vue加载的数据
                    if (!this.self.cover) this.self.cover = true
                    this.self.loading = false
                } else this.getTag(name,page,order)
            },
            // 获取标签下的文章数据
            async getTag(name = null, page = this.self.page.code, order = this.state.order.value) {

                this.state.name = name
                this.state.type = 'tag'

                // 缓存名称
                const cache = inisHelper.stringfy({api: 'article-tag', name, limit: this.self.limit, page, order})
                // 非最后一页获取数据
                if (!this.self.page.end) await Get('tag', {
                    name, page, order, limit: this.self.limit
                }).then(res=>{
                    if (res.code == 200) {
                        // 更新当前页码
                        this.self.page.code= page
                        this.self.data = res.data
                        inisHelper.set.session(cache, res.data)
                        // 最后一页
                        this.self.page.end = this.self.page.code >=  res.data.expand.page ? true : false
                        // 无刷URL
                        if (history.pushState) history.pushState({}, name, '/' + this.state.type + '/' + this.state.name)
                        // 显示Vue加载的数据
                        if (!this.self.cover) this.self.cover = true
                        this.self.loading = false
                    }
                })
            },
            // 下一组数据
            next(){
                if (this.state.type == 'sort') this.hasSort(false, this.state.name, ++this.self.page.code)
                else this.hasTag(false, this.state.name, ++this.self.page.code)
            },
            // 判空
            empty: data => inisHelper.is.empty(data),
            // 格式化数字
            format:(value = 0) => inisHelper.format.number(value),
            // 自然时间
            nature: (date = null,type = 5) => inisHelper.time.nature(inisHelper.date.to.time(date), type),
        },
        watch: {
            self: {
                handler(){
                    // 初始化数据
                    if (inisHelper.is.empty(this.self.data)) {
                        if (this.state.type == 'sort') this.hasSort(false, this.state.name, 1)
                        else this.hasTag(false, this.state.name, 1)
                    }
                },
                immediate: true,
            }
        }
    }).mount('#app')
})()