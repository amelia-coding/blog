module.exports = {
  title: "Amelia学前端",
  description: "我的前端日常日志，学习共勉",
  head: [
    ["link", { rel: "icon", href: "/new-logo.jpg" }]
  ],
  themeConfig: {
    // 你的GitHub仓库，请正确填写
    repo: "https://github.com/amelia-coding/blog",
    // 自定义仓库链接文字。
    repoLabel: "GitHub",
    nav: [{
        text: "博客",
        link: "/blog/",
      },
      {
        text: "面试",
        link: "/interview/",
      },
      {
        text: "阅读",
        link: "/book/",
      },
    ],
    sidebar: {
      "/blog/": [{
          title: "网络基础",
          collapsable: false,
          children: [],
        },
        {
          title: "JS",
          collapsable: false,
          children: ["js", "js-module"],
        },
        {
          title: "CSS",
          collapsable: false,
          children: ["css", "css-layout", "css-impl", "css-module", "css-animation"],
        },
        {
          title: "NodeJS",
          collapsable: false,
          children: [],
        },
        {
          title: "TypeScript",
          collapsable: false,
          children: [],
        },
        {
          title: "框架",
          collapsable: false,
          children: ["react-hook"],
        },
        {
          title: "性能优化",
          collapsable: false,
          children: ["performance"],
        },
        {
          title: "工程化",
          collapsable: false,
          children: ["webpack"],
        },
        {
          title: "编程基础",
          collapsable: false,
          children: ["sort"],
        }
      ],
      "/interview/": [{
        title: "JS",
        collapsable: false,
        children: ["js-basic1"],
      }],
      "": []
    },
  },
};