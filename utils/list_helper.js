const dummy = () => {
  return 1;
};

const totalLikes = (blog) => {
  const result = blog.reduce((accum, item) => {
    return (accum += item.likes);
  }, 0);
  return result;
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  //iterates each element of likes, with the current and previous values, if the previous one is greater, it continues with the previous one, otherwise it takes the current one, returns the structure where the reduce points to.
  const mostLikedBlog = blogs.reduce((prev, current) => {
    return prev.likes > current.likes ? prev : current;
  });

  return {
    title: mostLikedBlog.title,
    author: mostLikedBlog.author,
    likes: mostLikedBlog.likes,
  };
};
module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
