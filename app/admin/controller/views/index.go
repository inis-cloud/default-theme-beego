package views

type IndexController struct {
	BaseController
}

func (ctx *IndexController) Get() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	// 内容页面
	ctx.TplName = "admin/pages/index.html"
}