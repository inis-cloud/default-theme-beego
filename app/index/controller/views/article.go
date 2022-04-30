package views

import (
	"default-theme-beego/app/index/controller"
)

type ArticleController struct {
	BaseController
}

func (ctx *ArticleController) Get() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	id := ctx.GetString(":id")
	// 从cookie中获取登录token
	token   := ctx.Ctx.GetCookie("LOGIN-TOKEN")
	runtime := ctx.Ctx.GetCookie("runtime-" + id)
	item    := controller.Get("article", map[string]string{
		"id": id,
		"password": runtime,
	}, map[string]string{
		"login-token": token,
	})
	// 文章数据
	ctx.Data["item"] 	= item
	// 获取最多5篇的热门文章
	ctx.Data["hot"]		= controller.Get("article", map[string]string{
		"order": "views desc", "limit": "5",
	}, map[string]string{
		"login-token": token,
	})
	if item.Code == 200 {
		// 内容页面
		ctx.TplName = "index/pages/article.html"
	} else if item.Code == 403 {
		ctx.Data["error"] = ErrorItem{
			Code:    400,
			Title:   "密码错误！",
			Content: "您输入的访问密码有误！请重新输入！",
			HTML: `<script>
				setTimeout(function(){
					Notify('访问密码错误！','error')
				}, 1000);
			</script>`,
		}
		ctx.TplName = "layout/error.html"
	} else {
		ctx.Redirect("/", 302)
	}
}