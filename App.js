import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [posts, setPosts] = useState([]);
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch posts on component mount
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/posts');
            const data = await response.json();
            setPosts(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('image', image);
        formData.append('userId', 'test-user-id'); // Replace with actual user ID
        formData.append('caption', caption);

        try {
            const response = await fetch('http://localhost:5000/api/posts', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const newPost = await response.json();
                setPosts([newPost, ...posts]);
                setCaption('');
                setImage(null);
                document.getElementById('imageInput').value = '';
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const handleLike = async (postId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: 'test-user-id' })
            });
            
            if (response.ok) {
                const updatedPost = await response.json();
                setPosts(posts.map(post => 
                    post._id === postId ? updatedPost : post
                ));
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    if (loading) {
        return <div className="loading">Loading posts...</div>;
    }

    return (
        <div className="app">
            <header className="header">
                <h1>📸 Unstagram</h1>
            </header>

            <main className="main-content">
                {/* Create Post Form */}
                <div className="create-post">
                    <h2>Create New Post</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="file"
                            id="imageInput"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            required
                        />
                        <textarea
                            placeholder="Write a caption..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                        <button type="submit">Share Post</button>
                    </form>
                </div>

                {/* Posts Feed */}
                <div className="posts-feed">
                    {posts.map(post => (
                        <div key={post._id} className="post-card">
                            <div className="post-header">
                                <img 
                                    src={post.user?.profileImage || 'https://via.placeholder.com/40'} 
                                    alt={post.user?.username}
                                    className="profile-pic"
                                />
                                <span className="username">{post.user?.username}</span>
                            </div>
                            
                            <img 
                                src={`http://localhost:5000${post.imageUrl}`} 
                                alt={post.caption}
                                className="post-image"
                            />
                            
                            <div className="post-actions">
                                <button 
                                    onClick={() => handleLike(post._id)}
                                    className="like-btn"
                                >
                                    ❤️ {post.likes?.length || 0}
                                </button>
                            </div>
                            
                            <div className="post-caption">
                                <strong>{post.user?.username}</strong> {post.caption}
                            </div>
                            
                            {post.comments && post.comments.length > 0 && (
                                <div className="comments">
                                    {post.comments.slice(0, 2).map((comment, index) => (
                                        <div key={index} className="comment">
                                            <strong>{comment.user?.username}</strong> {comment.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default App;
