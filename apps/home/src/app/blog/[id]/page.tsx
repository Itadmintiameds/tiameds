import PlaceholderPage from '../../components/PlaceholderPage'
// import { blog } from '@/app/data/blog'

interface IParams {
    id: string
}

// const posts = blog;

const page = ({ params }: { params: IParams }) => {
    return (
        <PlaceholderPage
            eyebrow="Blog"
            title={params.id}
            message="This is a dynamic page"
            back={{ href: '/blog', label: 'Back to the blog' }}
        />
    )
}

export default page
