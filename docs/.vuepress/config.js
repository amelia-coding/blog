module.exports = {
  title: "Amelia的前端博客",
  description: "我的前端日常日志，学习共勉",
  head: [["link", { rel: "icon", href: "/new-logo.jpg" }]],
  themeConfig: {
    // 你的GitHub仓库，请正确填写
    repo: "https://amelia-coding.github.io/",
    // 自定义仓库链接文字。
    repoLabel: "GitHub",
    nav: [
      {
        text: "博客",
        link: "/blog/"
      },
      {
        text: "面试",
        link: "/interview/"
      },
      {
        text: "阅读",
        link: "/book/"
      }
    ],
    sidebar: {
      "/blog/": [
        {
          title: "JS",
          collapsable: false,
          children: ["js-basic1"]
        }
      ]
    }
  }
};
