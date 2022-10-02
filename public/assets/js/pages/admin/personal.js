(()=>{
    const app = Vue.createApp({
        data(){
            return {
                edit: {},
                user: inisHelper.get.session('USER-INFO'),
                show: {
                    verify: false,
                },
            }
        },
        mounted(){
            this.initData()
        },
        methods: {
            initData(){
                let data = [{id:0,text:'女'},{id:1,text:'男'},{id:2,text:'保密'}]
                data.map(item=>{
                    if (item.text == this.user.sex) item.selected = true
                })
                $('#personal-select-sex').select2({
                    minimumResultsForSearch: Infinity, data
                })
            },
            check(){
                delete this.edit.opt
                // 修改邮箱 - 验证邮箱
                if (this.show.verify) {
                    if (inisHelper.is.empty(this.edit.email))       Notify('请输入邮箱', 'warning')
                    else if (!inisHelper.is.email(this.edit.email)) Notify('请输入正确的邮箱', 'warning')
                    else his.save()
                }
            },
            save(){
                this.edit.account = this.user.account
                this.edit.id = this.user.id
                delete this.edit.opt
                let editPassword = false
                // 修改密码 - 两次校验
                if (!inisHelper.is.empty(this.password1) || !inisHelper.is.empty(this.password2)) {
                    if (inisHelper.is.empty(this.password1))      Notify('请输入密码', 'warning')
                    else if (inisHelper.is.empty(this.password2)) Notify('请再次输入密码', 'warning')
                    else if (this.password1 != this.password2)    Notify('两次输入的密码不一致', 'warning')
                    else {
                        editPassword = true
                        this.edit.password = this.password1
                    }
                }
                // 发送请求
                Put('users/save', this.edit,{
                    headers: {
                        Authorization: inisHelper.get.cookie('LOGIN-TOKEN')
                    }
                }).then(res=>{
                    if (res.code == 201) {

                        Notify(res.msg)
                        let time   = 60;
                        const code = document.querySelector("#verify-code");
                        let timeStop = setInterval(()=>{
                            time--;
                            if (time > 0) {
                                code.innerHTML = time + '秒后重新发送';
                                code.disabled = true
                            } else {
                                // 当减到0时赋值为60
                                timeo = 60;
                                code.innerHTML= '获取验证码';
                                // 清除定时器
                                clearInterval(timeStop);
                                code.disabled = false
                            }
                        },1000)

                    } else if (res.code == 200) {
                        Notify('修改成功', 'success')
                        delete this.edit.password
                        const user = inisHelper.object.deep.merge(inisHelper.get.session('USER-INFO'), this.edit)
                        inisHelper.set.session('USER-INFO', user)
                        if (editPassword) {
                            console.log(editPassword)
                            this.password1 = null
                            this.password2 = null
                            inisHelper.fetch.delete('/api/cookie')
                            inisHelper.clear.session('USER-INFO')
                            setTimeout(()=>{
                                Notify('请重新登录！', 'success')
                                // 返回首页
                                window.location.href = '/'
                            },1000)
                        }
                    } else Notify(res.msg, 'error')
                })
            },
            // 比较两个对象差异部分
            diff(obj1, obj2){
                let result = {}
                for (let key in obj1) {
                    if (obj1[key] != obj2[key]) {
                        result[key] = obj1[key]
                    }
                }
                return result
            },
        },
        computed: {

        },
        watch: {
            user: {
                handler(){
                    const user = inisHelper.get.session('USER-INFO')
                    this.show.verify = this.user.email != user.email ? true : false
                    this.edit = this.diff(this.user, user)
                },
                deep: true,
            }
        }
    }).mount('#app')
})()