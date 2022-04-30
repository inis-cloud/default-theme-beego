package views

type DynamicController struct {
	BaseController
}

func (ctx *DynamicController) Get() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	// 内容页面
	ctx.TplName = "index/pages/dynamic.html"
}