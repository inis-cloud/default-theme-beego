package views

type ChicController struct {
	BaseController
}

func (ctx *ChicController) Get() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	// 内容页面
	ctx.TplName = "index/pages/chic/" + ctx.GetString(":name") + ".html"
}

// Links
// 特色 -> 友链库
func (ctx *ChicController) Links() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	// 内容页面
	ctx.TplName = "index/pages/chic/links.html"
}