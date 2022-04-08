package views

import (
	"default-theme-beego/app/index/controller"
)

type IndexController struct {
	BaseController
}

func (ctx *IndexController) Get() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	// 轮播数据
	ctx.Data["banner"]	= controller.Get("banner")
	// 文章数据
	ctx.Data["article"] = controller.Get("article", map[string]string{
		"limit":"8",
	})
	// 内容页面
	ctx.TplName = "index/pages/index.html"
}