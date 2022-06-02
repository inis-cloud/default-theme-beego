package route

import (
	"default-theme-beego/app/index/controller/views"
	"github.com/astaxie/beego"
)

func init() {
	// 首页
	beego.Router("/", &views.IndexController{})
	// 文章的分组路由
	article := beego.NewNamespace("/article",
		beego.NSRouter(":id.html", &views.ArticleController{}),
		beego.NSRouter(":id.htm", &views.ArticleController{}),
		beego.NSRouter(":id", &views.ArticleController{}),
	)
	// 分类分组
	sort := beego.NewNamespace("/sort",
		beego.NSRouter(":name.html", &views.SortController{}),
		beego.NSRouter(":name.htm", &views.SortController{}),
		beego.NSRouter(":name", &views.SortController{}),
	)
	// 标签分组
	tag := beego.NewNamespace("/tag",
		beego.NSRouter(":name.html", &views.TagController{}),
		beego.NSRouter(":name.htm", &views.TagController{}),
		beego.NSRouter(":name", &views.TagController{}),
	)
	// 页面分组
	page := beego.NewNamespace("/page",
		beego.NSRouter(":name.html", &views.PageController{}),
		beego.NSRouter(":name.htm", &views.PageController{}),
		beego.NSRouter(":name", &views.PageController{}),
	)
	// inis特色
	chic := beego.NewNamespace("/chic",
		// 友链库页面
		beego.NSRouter("links.html", &views.ChicController{}, "*:Links"),
		beego.NSRouter("links.htm", &views.ChicController{}, "*:Links"),
		beego.NSRouter("links", &views.ChicController{}, "*:Links"),
		beego.NSRouter(":name.html", &views.ChicController{}),
		beego.NSRouter(":name.htm", &views.ChicController{}),
		beego.NSRouter(":name", &views.ChicController{}),
	)
	// 搜索
	search := beego.NewNamespace("/search",
		beego.NSRouter(".html", &views.SearchController{}),
		beego.NSRouter(".htm", &views.SearchController{}),
		beego.NSRouter("", &views.SearchController{}),
	)
	// 动态
	dynamic := beego.NewNamespace("/dynamic",
		beego.NSRouter(".html", &views.DynamicController{}),
		beego.NSRouter(".htm", &views.DynamicController{}),
		beego.NSRouter("", &views.DynamicController{}),
	)
	// 情侣空间
	lovers := beego.NewNamespace("/lovers",
		beego.NSRouter(".html", &views.LoversController{}),
		beego.NSRouter(".htm", &views.LoversController{}),
		beego.NSRouter("", &views.LoversController{}),
	)
	// 添加路由分组
	beego.AddNamespace(article, sort, tag, page, chic, search, dynamic, lovers)
}
