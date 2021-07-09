import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

import { Base } from '../../layouts';
import { getHeadings, getFiles, getFileBySlug, Heading } from '../../utils';
import { ArrowNarrowRightIcon, PencilIcon } from '../../components/icons';
import { ExternalLink, InlineCode } from '../../components';
import { createInit, instructions, intro } from '../../utils/console';

type PageProps = {
  headings: Heading[],
  mdxSource: MDXRemoteSerializeResult,
  filePath: string[],
  frontMatter:
    | {
        slug: string[],
        title: string,
        description: string,
        returns?: string,
      }
    | undefined,
};

export default function Docs({ headings, mdxSource, frontMatter, filePath }: PageProps) {
  const githubLink = `https://github.com/dinerojs/dinero.js/blob/main/website/data/docs/${filePath.join('/')}.mdx`;

  useEffect(() => {
    window.init = init;
    console.log(...intro);
  }, []);

  return (
    <Base headings={headings}>
      <Head>
        <title>{frontMatter?.title} | Dinero.js</title>
        <meta name="description" content={frontMatter?.description} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap"
          rel="stylesheet"
        />
      </Head>
      <>
        <div className="flex items-start mb-10 space-x-3 group">
          <div className="flex items-end flex-1 space-x-3">
            <h1 className="text-4xl font-bold text-gray-800">
              {frontMatter?.title}
            </h1>
            {frontMatter?.returns && (
              <>
                <ArrowNarrowRightIcon className="h-4 mb-2 text-gray-400" />
                <InlineCode>
                  <span className="inline-block mb-1.5">
                    {frontMatter.returns}
                  </span>
                </InlineCode>
              </>
            )}
          </div>
          <ExternalLink href={githubLink} title="Edit this page on GitHub" className="w-5 h-5 mt-3 text-gray-400 transition-opacity duration-100 ease-in-out opacity-0 group-hover:opacity-100">
            <PencilIcon />
          </ExternalLink>
        </div>
        <MDXRemote {...mdxSource} />
      </>
    </Base>
  );
}

const init = createInit({
  defaultVersion: '1.8.0',
  async getLibrary({ version }) {
    const url = `https://cdn.jsdelivr.net/npm/dinero.js@${version}/build/esm/dinero.min.js`;
    const { default: library } = await import(/* webpackIgnore: true */ url);

    return library;
  },
  onInit({ library }) {
    window._ = library;

    console.log(...instructions);
  },
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug || ['index'];
  const filePath = [slug].flat();
  const { source, mdxSource, frontMatter } = await getFileBySlug(
    'docs',
    filePath
  );
  const headings = getHeadings(source);

  return { props: { headings, mdxSource, frontMatter, filePath } };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await getFiles('docs');
  const paths = pages.map((page) => {
    const slug = page.replace('.mdx', '').split('/').filter(Boolean);
    const [root] = slug;

    return { params: { slug: root === 'index' ? [] : slug } };
  });

  return {
    paths,
    fallback: false,
  };
};
