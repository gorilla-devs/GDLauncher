using System;
using System.Collections.Generic;

namespace GDLauncher.Models
{
    /// <summary>
    /// Triggered queue. Provides events immediately before and after enqueueuing and dequeuing.
    /// </summary>
    public class TriggeredQueue<T>
    {
        /// <summary>
        /// The internal queue.
        /// </summary>
        readonly Queue<T> queue = new Queue<T>();

        /// <summary>
        /// Occurs immediately before an item is enqueued. Provides peek access to the queue before enqueueuing.
        /// </summary>
        public event WillEnqueueEventHandler<T> WillEnqueue;

        /// <summary>
        /// Occurs immediately before an item is dequeued. Provides peek access to the queue before dequeuing.
        /// </summary>
        public event WillDequeueEventHandler<T> WillDequeue;

        /// <summary>
        /// Occurs immediately after an item is enqueued. Provides access to the item that was just enqueued.
        /// </summary>
        public event DidEnqueueEventHandler<T> DidEnqueue;

        /// <summary>
        /// Occurs immediately after an item is dequeued. Provides access to the item that was just dequeued.
        /// </summary>
        public event DidDequeueEventHandler<T> DidDequeue;

        /// <summary>
        /// Raises the WillEnqueue event.
        /// </summary>
        /// <param name="currentHeadOfQueue">Current head of queue.</param>
        /// <param name="itemToEnqueue">Item to enqueue.</param>
        protected virtual void OnWillEnqueue(T currentHeadOfQueue, T itemToEnqueue)
        {
            if (WillEnqueue != null)
                WillEnqueue(this, new WillEnqueueEventArgs<T>(currentHeadOfQueue, itemToEnqueue));
        }

        /// <summary>
        /// Raises the DidEnqueue event.
        /// </summary>
        /// <param name="enqueuedItem">Enqueued item.</param>
        /// <param name="previousHeadOfQueue">Previous head of queue.</param>
        protected virtual void OnDidEnqueue(T enqueuedItem, T previousHeadOfQueue)
        {
            if (DidEnqueue != null)
                DidEnqueue(this, new DidEnqueueEventArgs<T>(enqueuedItem, previousHeadOfQueue));
        }

        /// <summary>
        /// Raises the WillDequeue event.
        /// </summary>
        /// <param name="itemToBeDequeued">Item to be dequeued.</param>
        protected virtual void OnWillDequeue(T itemToBeDequeued)
        {
            if (WillDequeue != null)
                WillDequeue(this, new WillDequeueEventArgs<T>(itemToBeDequeued));
        }

        /// <summary>
        /// Raises the did dequeue event.
        /// </summary>
        /// <param name="item">Item.</param>
        protected virtual void OnDidDequeue(T dequeuedItem, T nextItem)
        {
            if (DidDequeue != null)
                DidDequeue(this, new DidDequeueEventArgs<T>(dequeuedItem, nextItem));
        }

        /// <summary>
        /// Enqueue the specified item.
        /// </summary>
        /// <param name="item">Item.</param>
        public virtual void Enqueue(T item)
        {
            T peekItem;

            try { peekItem = queue.Peek(); }
            catch (InvalidOperationException) { peekItem = (default(T)); }

            OnWillEnqueue(peekItem, item);

            queue.Enqueue(item);

            OnDidEnqueue(item, peekItem);
        }

        /// <summary>
        /// Dequeue this instance.
        /// </summary>
        public virtual T Dequeue()
        {
            T peekItem;

            try { peekItem = queue.Peek(); }
            catch (InvalidOperationException) { peekItem = (default(T)); }

            OnWillDequeue(peekItem);

            T dequeuedItem = queue.Dequeue();

            try { peekItem = queue.Peek(); }
            catch (InvalidOperationException) { peekItem = (default(T)); }

            OnDidDequeue(dequeuedItem, peekItem);

            return dequeuedItem;
        }

        /// <summary>
        /// Gets the count.
        /// </summary>
        /// <value>The count.</value>
        public int Count
        {
            get { return queue.Count; }
        }

        /// <summary>
        /// Gets a value indicating whether this instance is empty.
        /// </summary>
        /// <value><c>true</c> if this instance is empty; otherwise, <c>false</c>.</value>
        public bool IsEmpty
        {
            get { return queue.Count < 1; }
        }
    }

    /// <summary>
    /// WillEnqueue event handler.
    /// </summary>
    public delegate void WillEnqueueEventHandler<T>(object sender, WillEnqueueEventArgs<T> e);

    /// <summary>
    /// DidEnqueue event handler.
    /// </summary>
    public delegate void DidEnqueueEventHandler<T>(object sender, DidEnqueueEventArgs<T> e);

    /// <summary>
    /// WillDequeue event handler.
    /// </summary>
    public delegate void WillDequeueEventHandler<T>(object sender, WillDequeueEventArgs<T> e);

    /// <summary>
    /// DidDequeue event handler.
    /// </summary>
    public delegate void DidDequeueEventHandler<T>(object sender, DidDequeueEventArgs<T> e);

    /// <summary>
    /// WillEnqueue event arguments.
    /// </summary>
    public class WillEnqueueEventArgs<T> : EventArgs
    {
        readonly T _CurrentHeadOfQueue;
        readonly T _ItemToEnqueue;

        /// <summary>
        /// Gets the peeked item.
        /// </summary>
        /// <value>The peeked item.</value>
        /// <remarks>May be a default value if the queue is empty. Make sure to check for a default value (i.e. null) before using.</remarks>
        public T CurrentHeadOfQueue
        {
            get { return _CurrentHeadOfQueue; }
        }

        /// <summary>
        /// Gets the item to be enqueued.
        /// </summary>
        /// <value>The item to be enqueued.</value>
        public T ItemToEnqueue
        {
            get { return _ItemToEnqueue; }
        }

        /// <summary>
        /// Initializes a new instance of the WillEnqueueEventArgs class.
        /// </summary>
        /// <param name="currentHeadOfQueue">Current head of queue.</param>
        /// <param name="itemToEnqueue">Item to enqueue.</param>
        public WillEnqueueEventArgs(T currentHeadOfQueue, T itemToEnqueue)
        {
            _ItemToEnqueue = itemToEnqueue;
            _CurrentHeadOfQueue = currentHeadOfQueue;
        }
    }

    /// <summary>
    /// DidEnqueue event arguments.
    /// </summary>
    public class DidEnqueueEventArgs<T> : EventArgs
    {
        readonly T _EnqueuedItem;
        readonly T _PreviousHeadOfQueue;

        /// <summary>
        /// Gets the enqueued item.
        /// </summary>
        /// <value>The enqueued item.</value>
        public T EnqueuedItem
        {
            get { return _EnqueuedItem; }
        }

        /// <summary>
        /// Gets the previous head of queue.
        /// </summary>
        /// <value>The previous head of queue.</value>
        /// /// <remarks>May be a default value if the queue is empty. Make sure to check for a default value (i.e. null) before using.</remarks>
        public T PreviousHeadOfQueue
        {
            get { return _PreviousHeadOfQueue; }
        }

        /// <summary>
        /// Initializes a new instance of the DidEnqueueEventArgs class.
        /// </summary>
        /// <param name="enqueuedItem">Enqueued item.</param>
        /// <param name="previousHeadOfQueue">Previous head of queue.</param>
        public DidEnqueueEventArgs(T enqueuedItem, T previousHeadOfQueue)
        {
            _EnqueuedItem = enqueuedItem;
            _PreviousHeadOfQueue = previousHeadOfQueue;

        }
    }

    /// <summary>
    /// WillDequeue event arguments.
    /// </summary>
    public class WillDequeueEventArgs<T> : EventArgs
    {
        readonly T _ItemToBeDequeued;

        /// <summary>
        /// Gets the peeked item.
        /// </summary>
        /// <value>The peeked item.</value>
        /// /// <remarks>May be a default value if the queue is empty. Make sure to check for a default value (i.e. null) before using.</remarks>
        public T ItemToBeDequeued
        {
            get { return _ItemToBeDequeued; }
        }

        /// <summary>
        /// Initializes a new instance of the WillDequeueEventArgs class.
        /// </summary>
        /// <param name="itemToBeDequeued">Item to be dequeued.</param>
        public WillDequeueEventArgs(T itemToBeDequeued)
        {
            _ItemToBeDequeued = itemToBeDequeued;
        }
    }

    /// <summary>
    /// DidDequeue event arguments.
    /// </summary>
    public class DidDequeueEventArgs<T> : EventArgs
    {
        readonly T _DequeuedItem;
        readonly T _NextItem;

        /// <summary>
        /// Gets the dequeued item.
        /// </summary>
        /// <value>The dequeued item.</value>
        public T DequeuedItem
        {
            get { return _DequeuedItem; }
        }

        /// <summary>
        /// Gets the next (peeked) item. This item is not yet dequeued.
        /// </summary>
        /// <value>The next item.</value>
        /// /// <remarks>May be a default value if the queue is emoty after dequeuing. Make sure to check for a default value (i.e. null) before using.</remarks>
        public T NextItem
        {
            get { return _NextItem; }
        }

        /// <summary>
        /// Initializes a new instance of the DidDequeueEventArgs class.
        /// </summary>
        /// <param name="dequeuedItem">Dequeued item.</param>
        /// <param name="nextItem">Next item.</param>
        public DidDequeueEventArgs(T dequeuedItem, T nextItem)
        {
            _DequeuedItem = dequeuedItem;
            _NextItem = nextItem;
        }
    }
}