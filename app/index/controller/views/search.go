package views

import (
	"default-theme-beego/app/index/controller"
)

type SearchController struct {
	BaseController
}

func (ctx *SearchController) Get() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	ctx.Data["value"]   = ctx.GetString("value")
	// 获取最多5篇的热门文章
	ctx.Data["hot"]		= controller.Get("article", map[string]string{
		"order": "views desc", "limit": "5",
	})
	// 获取最多99个标签
	ctx.Data["tag"]		= controller.Get("tag", map[string]string{
		"limit": "99",
	})
	// 内容页面
	ctx.TplName = "index/pages/search.html"
}