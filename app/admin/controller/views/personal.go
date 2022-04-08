package views

type PersonalController struct {
	BaseController
}

func (ctx *PersonalController) Get() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	// 内容页面
	ctx.TplName = "admin/pages/personal.html"
}
