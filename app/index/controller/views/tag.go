package views

import (
	"default-theme-beego/app/index/controller"
)

type TagController struct {
	BaseController
}

func (ctx *TagController) Get() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	// 文章数据
	ctx.Data["item"] 	= controller.Get("tag", map[string]string{
		"name" : ctx.GetString(":name"),
		"limit": "6",
	})
	// 内容页面
	ctx.TplName = "index/pages/tag.html"
}