(()=>{

    const app = Vue.createApp({
        data() {
            return {
                hitokoto: {
                    data: {},
                    load: false
                },
                directory: [],
                runtime: null,
                base64:{
                    load: false,
                }
            }
        },
        components: {
            'comment-box': components.commentBox(),
            'comment-article': components.commentArticle(),
        },
        mounted() {
            this.imagesBox()
            this.runHitokoto()
            this.getTagAll()
        },
        methods: {
            imagesBox() {
                // 获取渲染文章下的全部图片
                const images = document.querySelector(".markdown").getElementsByTagName("img");
                for (let item of images) {
                    // 给图片上预览盒子
                    item.outerHTML = `<a data-fancybox="gallery" href="${item.src}" data-caption="${item.alt}">${item.outerHTML}</a>`
                }
            },
            // 发起一言请求
            runHitokoto() {
                this.hitokoto.load = true
                inisHelper.fetch.get('https://v1.hitokoto.cn').then(res => {
                    this.hitokoto = {
                        data: res,
                        load: false
                    }
                })
            },
            // 评论完成
            finish() {
                const cache = inisHelper.stringfy({api: 'comments', id: this.aid})
                // 清理评论相关缓存
                for (let item in sessionStorage.valueOf()) if (item.indexOf(cache) != -1) {
                    sessionStorage.removeItem(item)
                }
                Notify(`评论成功！但需要刷新一下才能看到<a href='${document.URL}' class="ml-1">刷新</a>`, 'success')
            },
            // 获取文章内的全部H1-6标签
            getTagAll() {
                let map = []
                // 采用递归调用的方法，比较方便和简单。
                const fds = node => {
                    if (node.nodeType === 1) {
                        // 这里我们用nodeName属性，直接获取节点的节点名称
                        const tagName = node.nodeName;
                        if (tagName.slice(0, 1) == "H" && tagName.slice(0, 2) != "HR") {
                            if (!inisHelper.is.empty(node.textContent)) {
                                // 给H标签设置唯一的ID
                                const id = tagName + '-' + (map.length + 1)
                                node.setAttribute('id', id)
                                map.push({
                                    id,
                                    name: tagName,
                                    index: parseInt(tagName.slice(1, 2)),
                                    text: node.textContent
                                })
                            }
                        }
                    }
                    // 递归调用 - 获取该元素节点的所有子节点
                    for (let item of node.childNodes) fds(item)
                }
                fds(document.querySelector('.markdown.preview'))
                if (!inisHelper.is.empty(map)) {
                    this.directory = inisHelper.array.to.tree(map)
                }
            },
            // 创建海报
            createPoster(){
                $('#poster-alert-modal').modal('show')
                // 清空canvas
                this.$refs.qrcode.innerHTML = null
                const qrcode = new QRCode(this.$refs.qrcode, {
                    text: window.location.href,
                    width: 70,
                    height: 70,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            },
            // 创建画布
            createCanvas(){
                html2canvas(this.$refs.canvas).then(canvas => {
                    let aTag = document.createElement('a')
                    aTag.download = this.$refs.cover.title + '.png'
                    aTag.href     = canvas.toDataURL("image/png")
                    aTag.dataset.downloadurl = [aTag.download, aTag.href].join(':')
                    document.body.appendChild(aTag)
                    aTag.click()
                    document.body.removeChild(aTag)
                    // canvas.style.setProperty('object-fit','cover')
                    // document.querySelector('#poster-alert-modal .modal-content').appendChild(canvas)
                });
            },
            // 判断字符串是否是base64图片
            isBase64Image(string){
                const  reg = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i;
                return reg.test(string)
            },
            // 更新分享的图片
            uploadChange(){
                const file = this.$refs.inputFile.files[0]
                if (file) {
                    inisHelper.image.base64(file).then(res => {
                        this.$refs.cover.src = res
                    })
                }
            },
            // 定位
            toTarget: id => $("html,body").animate({scrollTop: $(`#${id}`).offset().top - 200}, 1),
            // 路由跳转
            toRoute: url => window.location.href = url,
            // 自然时间
            nature: (date = null, type = 5) => inisHelper.time.nature(inisHelper.date.to.time(date), type),
            // 格式化数字
            format: (value = 0) => inisHelper.format.number(value),
            // 判断是否为空
            empty: (data = null) => inisHelper.is.empty(data),
        },
        directives: {
            highlight: {
                // 在base.js封装了公共方法
                mounted: (el) => directives.highlight(el)
            },
            base64: {
                // 在base.js封装了公共方法
                mounted: (el, binding) => {
                    if (!binding.instance.isBase64Image(el.src)) {
                        Get('other/base64', {
                            url: el.src
                        }).then(res => {
                            if (res.code == 200) el.src = res.data.base64
                        })
                    }
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
    })
    app.component('tree', {
        props: ['array'],
        methods: {
            // 定位
            toTarget(id){
                $("html,body").animate({scrollTop:$(`#${id}`).offset().top-200},1);
            },
        },
        template: `<li v-for="(item, index) in array" :key="index" class="side-nav-item ps-3">
            <a v-on:click="toTarget(item.id)" data-bs-toggle="collapse" :href="'#' + item.id + '-mark'" aria-expanded="false" :aria-controls="item.id + '-mark'" class="side-nav-link collapsed py-1">
                <i class="mdi mdi-tag-multiple-outline text-dark"></i>
                <span class="text-dark"> {{item.text}} </span>
                <span v-if="item.children" class="menu-arrow text-dark"></span>
            </a>
            <div v-if="item.children" class="collapse" :id="item.id + '-mark'">
                <tree :array="item.children"></tree>
            </div>
        </li>`
    })
    app.mount('#app')
})()