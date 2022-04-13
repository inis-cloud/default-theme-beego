package views

import (
	"default-theme-beego/app/index/controller"
	"net/url"
)

type SortController struct {
	BaseController
}

func (ctx *SortController) Get() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	// 解码中文
	name, _ := url.QueryUnescape(ctx.GetString(":name"))
	// 文章数据
	ctx.Data["item"] 	= controller.Get("article-sort", map[string]string{
		"name" : name,
		"limit": "6",
	})
	// 内容页面
	ctx.TplName = "index/pages/sort.html"
}