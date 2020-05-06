module.exports = {
    title: "Amelia学前端",
    description: "我的前端日常日志，学习共勉",
    head: [
        ["link", { rel: "icon", href: "/new-logo.jpg" }]
    ],
    themeConfig: {
        // 你的GitHub仓库，请正确填写
        repo: "https://amelia-coding.github.io/",
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
            "/blog/": [
                {
                    title: "网络基础",
                    collapsable: false,
                    children: [],
                },
                {
                    title: "JS",
                    collapsable: false,
                    children: [],
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
                    title: "前端框架",
                    collapsable: false,
                    children: [],
                },
                {
                    title: "前端性能优化",
                    collapsable: false,
                    children: [],
                },
                {
                    title: "前端工程化与持续构建",
                    collapsable: false,
                    children: ["webpack"],
                },
            ],
            "/interview/": [
                {
                    title: "JS",
                    collapsable: false,
                    children: ["js-basic1"],
                } 
            ],
            "": [
            ]
        },
    },
};