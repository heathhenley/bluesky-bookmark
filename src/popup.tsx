// src/popup.tsx
import React, { useEffect, useState } from "react";

type Bookmark = {
  author: string;
  url: string;
  id: string;
};

const Popup: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    chrome.storage.sync.get("bookmarks", (data) => {
      setBookmarks(data.bookmarks || []);
    });
  }, []);

  const clearBookmarks = () => {
    chrome.storage.sync.set({ bookmarks: [] }, () => {
      setBookmarks([]);
    });
  };

  return (
    <div>
      <h2>Saved Skeets</h2>
      <ul>
        {bookmarks.map((bookmark, index) => (
          <li key={index}>
            <a href={bookmark.url} target="_blank">
              {bookmark.author}
            </a>
            <button
              onClick={() => {
                chrome.storage.sync.set(
                  { bookmarks: bookmarks.filter((_, i) => i !== index) },
                  () => {
                    setBookmarks(bookmarks.filter((_, i) => i !== index));
                  }
                );
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button onClick={clearBookmarks}>Clear All Bookmarks</button>
    </div>
  );
};

export default Popup;
