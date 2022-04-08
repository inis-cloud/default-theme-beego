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
	// 文章数据
	ctx.Data["item"] 	= controller.Get("article", map[string]string{
		"id": ctx.GetString(":id"),
	})
	// 获取最多5篇的热门文章
	ctx.Data["hot"]		= controller.Get("article", map[string]string{
		"order": "views desc", "limit": "5",
	})
	// 内容页面
	ctx.TplName = "index/pages/article.html"
}