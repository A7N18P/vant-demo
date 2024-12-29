import { defineMock } from 'vite-plugin-mock-dev-server'
import Mock from 'mockjs'

export default defineMock([
    {
        url: '/api/category/list',
        body: () => Mock.mock({

            'data': [{
                'id': 1,
                'title': '政协',
                'url': '@url',
                'coverUrl': '@image'
            }, {
                'id': 2,
                'title': '人大',
                'url': '@url',
                'coverUrl': '@image'
            }]

        })
    },
    {
        url: '/api/category/detail',
        body: () => Mock.mock({
            data: {
                'title|1': ['政协', '人大'],
                'coverUrl': '@image'

            }
        })
    },
    {
        url: '/api/category/folder',
        body: () => Mock.mock({

            'data|4': [{
                "id": "@id",
                'title|1': ['开幕现场', '分组讨论', '闭幕现场', '人物风采'],
                'url': '@url',
                'coverUrl': '@image'
            }]


        })
    },
    {
        url: '/api/folder/list',
        body: () => Mock.mock({


            'data|1-10': [{
                'id': '@id',
                'url': '@url',
                'title': '@paragraph',
                'coverUrl': '@image'
            }]


        })
    },

])