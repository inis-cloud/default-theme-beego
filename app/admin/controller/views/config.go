package views

type ConfigController struct {
	BaseController
}

func (ctx *ConfigController) Get() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	// 内容页面
	ctx.TplName = "admin/pages/config.html"
}