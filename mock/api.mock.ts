import { defineMock } from 'vite-plugin-mock-dev-server'
import Mock from 'mockjs'

export default defineMock([
    {
        url: '/api/test',
        body: Mock.mock({
            code: 200,
            data: {
                'list|1-10': [{
                    'id|+1': 1,
                    'name': '@cname',
                    'url': '@url',
                    'coverUrl': '@image'
                }]
            }
        })
    },

])