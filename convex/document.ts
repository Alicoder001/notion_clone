import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
export const createDocument = mutation({
  args: {
    title: v.string(),
    parendDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be authenticated to create a document.");
    }
    const userId = identity.subject;
    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parendDocument,
      userId,
      isArchived: false,
      isPublished: false,
    });
    return document;
  },
});
export const getDocuments = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be authenticated to create a document.");
    }
    const userId = identity.subject;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument)
      )
      .filter((query) => query.eq(query.field("isArchived"), false))
      .order("desc")
      .collect();
    return documents;
  },
});
export const archive = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be authenticated to create a document.");
    }
    const userId = identity.subject;
    const exitingDocument = await ctx.db.get(args.id);
    if (!exitingDocument) {
      throw new Error("Document not found.");
    }
    if (exitingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const archivedChildren = async (documendId: Id<"documents">) => {
      const childrens = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documendId)
        )
        .collect();
      for (const child of childrens) {
        await ctx.db.patch(child._id, { isArchived: true });
        archivedChildren(child._id);
      }
    };
    const document = await ctx.db.patch(args.id, { isArchived: true });

    archivedChildren(args.id);
    return document;
  },
});
export const getTrashDocuments = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();

    return documents;
  },
});

export const remove = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be authenticated to create a document.");
    }
    const userId = identity.subject;
    const exitingDocument = await ctx.db.get(args.id);
    if (!exitingDocument) {
      throw new Error("Document not found.");
    }
    if (exitingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const document = await ctx.db.delete(args.id);
    return document;
  },
});

export const getDocumentById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found.");
    }
    if (document.isPublished && !document.isArchived) {
      return document;
    }
    if (!identity) {
      throw new Error("You must be authenticated to view this document.");
    }
    const userId = identity.subject;
    if (document.userId !== userId) {
      throw new Error("Unauthorized");
    }
    return document;
  },
});
export const updateFields = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be authenticated to update a document.");
    }
    const userId = identity.subject;
    const { id, ...rest } = args;
    const exitingDocument = await ctx.db.get(id);
    if (!exitingDocument) {
      throw new Error("Document not found.");
    }
    if (exitingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const document = await ctx.db.patch(id, rest);

    return document;
  },
});

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be authenticated to restore a document.");
    }
    const userId = identity.subject;
    const exitingDocument = await ctx.db.get(args.id);
    if (!exitingDocument) {
      throw new Error("Document not found.");
    }
    if (exitingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const unArchivedChildren = async (documendId: Id<"documents">) => {
      const childrens = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documendId)
        )
        .collect();
      for (const child of childrens) {
        await ctx.db.patch(child._id, { isArchived: false });
        unArchivedChildren(child._id);
      }
    };
    const options: Partial<Doc<"documents">> = {
      isArchived: false,
    };

    if (exitingDocument.parentDocument) {
      const parentDocumentId = exitingDocument.parentDocument;

      const parentDocument = await ctx.db.get(parentDocumentId);

      if (!parentDocument || parentDocument.isArchived) {
        options.parentDocument = undefined;
      }
    }

    const document = await ctx.db.patch(args.id, options);
    unArchivedChildren(args.id);
    return document;
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((query) => query.eq(query.field("isArchived"), false))
      .order("desc")
      .collect();
    return documents;
  },
});

export const getAllDocuments = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be authenticated to create a document.");
    }
    const userId = identity.subject;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((query) => query.eq(query.field("isArchived"), false))
      .order("desc")
      .collect();
    return documents;
  },
});
