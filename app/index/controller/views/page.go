package views

import (
	"default-theme-beego/app/index/controller"
)

type PageController struct {
	BaseController
}

func (ctx *PageController) Get() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	// 文章数据
	ctx.Data["item"] 	= controller.Get("page", map[string]string{
		"alias": ctx.GetString(":name"),
	})
	// 内容页面
	ctx.TplName = "index/pages/page.html"
}