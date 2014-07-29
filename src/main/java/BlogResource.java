/**
 * Created with IntelliJ IDEA.
 * User: Rambabu
 * Date: 7/26/14
 * Time: 9:20 PM
 * To change this template use File | Settings | File Templates.
 */
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import net.vz.mongodb.jackson.DBCursor;
import net.vz.mongodb.jackson.JacksonDBCollection;

import com.yammer.metrics.annotation.Timed;
import net.vz.mongodb.jackson.WriteResult;

@Path("/blogs")
@Produces(value = MediaType.APPLICATION_JSON)
@Consumes(value = MediaType.APPLICATION_JSON)
public class BlogResource {

    private JacksonDBCollection<Blog, String> collection;

    public BlogResource(JacksonDBCollection<Blog, String> blogs) {
        this.collection = blogs;
    }

    @POST
    @Path("/blogs/{id}")
    @Timed
    public Response publishNewBlog(@Valid Blog blog) {
        WriteResult<Blog, String> result = null;
        if(blog != null && blog.isValid())  {
            if(blog.getId() != null) {
                result = collection.updateById(blog.getId(), blog);
                if(result == null) {
                    return Response.serverError().build();
                }
            }else {
                result = collection.insert(blog);
                if(result == null) {
                    return Response.serverError().build();
                }

                blog.setId(result.getSavedId());
            }
        }

        return Response.created(URI.create(blog.getId())).entity(blog).build();
    }

    @GET
    @Path("/blogs/{id}")
    @Timed
    public Blog getBlog(@PathParam("id") String id) {
        Blog b = collection.findOneById(id);
        if (b != null) {
            return b;
        } else {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }
    }

    @GET
    @Path("/blogs")
    @Timed
    public List<Blog> listBlogs() {
        DBCursor<Blog> dbCursor = collection.find();
        List<Blog> blogs = new ArrayList<Blog>();
        while (dbCursor.hasNext()) {
            Blog blog = dbCursor.next();
            blogs.add(blog);
        }

        return blogs;
    }



    @DELETE
    @Path("/blogs/{id}")
    @Timed
    @Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.TEXT_PLAIN})
    public void deleteBlog(@PathParam("id") String id) {
        /**
         * Note: AngularJS $resource will send a DELETE request as content-type test/plain for some reason;
         * so therefore we must add MediaType.TEXT_PLAIN here.
         */
        if (collection.findOneById(id) != null) {
            collection.removeById(id);
        } else {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }
    }
}
