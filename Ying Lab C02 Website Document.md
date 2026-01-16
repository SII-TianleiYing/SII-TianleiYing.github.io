# Ying Lab C02 Website Document

> *更新日期：2026-01-16 by Ziming*

---

## 0 基本架构

我们使用了数据-展示分离，这是一种非特定框架的轻量化的结构。内容数据保存在.json文件中，通过.js在客户端进行渲染，HTML 只做容器。便于不修改网页代码基础上快速对日常信息进行维护。

> **内容**：存放在 `data/*.json`  
>
> **页面骨架**：`*.html`  
>
> **渲染逻辑**：`skin/js/*.js`
>
> **样式**：`skin/css/style.css` + `skin/css/mobile.css`

优点：

> **更新信息不需要改 HTML**：只改 JSON 就能更新成员/模型/论文等
>
> **结构稳定**：降低改内容导致页面排版崩坏的风险
>
> **一致性更强**：同一类内容（如 Member 卡片）由统一脚本渲染，风格一致

目前我们的网页的部分代码可能存在style覆盖以及部分注释不清晰等问题，不影响日常使用但可能会给网站升级带来一定麻烦，请见谅！



## 1 项目目录结构

```
.
├── index.html
├── People.html
├── Models.html
├── Databases.html
├── Publications.html
├── About.html
├── data/
│ ├── members.json
│ ├── models.json
│ ├── databases.json
│ └── publications.json
└── skin/
    ├── css/
    │ ├── style.css
    │ ├── mobile.css
    │ ├── slick.css
    │ ├── slick-theme.css
    │ └── swiper-bundle.min.css
    ├── js/
    │ ├── common.js
    │ ├── people-members.js
    │ ├── models.js
    │ └── ...
    ├── fonts/
    ├── logo/
    └── images/
        ├── people/
        │ ├── default.png
        │ └── *.jpg
        ├── models/
        └── databases/
```



## 2 信息维护

### Models

Path: 

```
data\models.json
```

示例：

```json
[
  {
    "id": "2024-abdiff",
    "type": "A",
    "name": "AbDiff",
    "abstract": "Generative prediction of antibody conformational ensembles using diffusion models.",
    "links": "https://sii-tianleiying.github.io/abdiff-page/",
    "graphical_abstract": "skin/images/models/abdiff.jpg"
  }, // ',' here
  {
    "id": "2025-XXX",
    "type": "I",
    "name": "XXX",
    "abstract": "XXX",
    "links": "https://example.com/XXX",
    "graphical_abstract": "skin/images/models/XXX.png"
  } // no ',' at the end
 ]
```

"id" 用于确定内容的唯一标识符，无特殊要求，不重复即可，推荐"<Year>-<ModelName>"；

"type" A系列或者I系列；

"link" 可以链接到WebApp或者Poster，用户点击时跳转的地址；

"abstract" 在10词长左右比较合理；

"graphical_abstract" 图摘要地址，缺省时请填写""，会展示default.png。

请把图摘要文件妥善命名后放置在：

```
"skin/images/models/<YourGraphicalAbstract>"
```



### Databases

Path: 

```
data\databases.json
```

示例：

```json
[
 {
  "id": "2024-aXXX",
  "name": "XXX",
  "abstract": "XXX.",
  "links": "https://example.com/XXX",
  "graphical_abstract": "skin/images/databases/XXX.jpg"
 }
]
```

"id" 用于确定内容的唯一标识符，无特殊要求，不重复即可，推荐"<Year>-<DatabaseName>"；

"link" 可以链接到Web Serve或者Poster，用户点击时跳转的地址；

"abstract" 在10词长左右比较合理；

"graphical_abstract" 图摘要地址，缺省时请填写""，会展示default.png。

请把图摘要文件妥善命名后放置在：

```
"skin/images/databases/<YourGraphicalAbstract>"
```



### Publications

Path: 

```
data\publications.json
```

示例：

```json
[
 {
  "id": "2025-kong-sdab-cell-disco",
  "year": 2025,
  "date": "2025-06-15",
  "type": "journal",
  "venue": { "name": "Cell Discovery", "if": "12.5" },
  "title": "A synergistic generative-ranking framework for tailored design of therapeutic single-domain antibodies.",
  "authors": ["Y. Kong", "J. Shi", "F. Wu", "T. Ying"],
  "doi": "10.1038/s41421-025-00843-8",
  "abstract": "XXX",
  "links": [
   { "kind": "paper", "label": "Journal Page", "url": "https://example.com/paper/2025-sdab" },
   { "kind": "pdf", "label": "PDF", "url": "https://example.com/paper/2025-sdab.pdf" }
  ]
 }
]
```

"id" 用于确定内容的唯一标识符，无特殊要求，不重复即可，推荐"<Year>-<Author>-<title>-<Journal>"；

"year" 用于确定年份，**※不要加引号**；

"type" 可以选择：

```
"journal":(show) "Journal Article",
"conference": "Conference Paper",
"preprint": "Preprint",
"patent": "Patent",
"bookchapter": "Book Chapter",
"dataset": "Dataset",
"other": "Other"
```

"abstract" 换行使用"\n\n"；

"links" 可以填写获得文章的途径，"label" 表示了显示在web上的文字说明，如果 "kind" 填写 "pdf"，可以在 "url" 字段填写PDF路径；

缺省请填写""。



Publications的攥写无需不同文献的填写顺序，Publications.js会自动按年份和月份进行渲染。



### Members

Path: 

```
data\members.json
```

示例：

```json
[
 {
  "id": "wuyanling",
  "name": "Yanliang Wu",
  "role": "Research Fellow",
  "title": "",
  "avatar": "skin/images/people/wuyanling.jpg",
  "major": "",
  "intro": "Dr. Wu is a Research Fellow with long-standing expertise in antiviral-immunological intervention strategies...\n\nHer representative work includes more than 30 SCI-indexed publications as corresponding or first author in leading journals such as Cell, Cell Host & Microbe, and Nature Communications, with over 4,000 total citations...",
  "links": {
   "email": "XX@fudan.edu.cn",
   "github": "#", 
   "homepage": "#"
  }
 }
]
```

必须填写的字段："id"，"name"，"role"，"intro"；

"id" 用于确定内容的唯一标识符，无特殊要求，不重复即可，推荐"<LastNameFirstName>"；

"role" 填写职称/职位/身份

"avatar" 个人照片地址，缺省时请填写""，会展示default.png。

"intro" 换行使用"\n\n"；

"links" 可以填写个人联系方式/GitHub主页/个人网站；

缺省请填写""。



请把个人照片文件妥善命名后放置在：

```
"skin/images/people/<YourPhoto>"
```

