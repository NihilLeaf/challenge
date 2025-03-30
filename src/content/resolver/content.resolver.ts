import { Logger, UseGuards } from '@nestjs/common'
import { Resolver, Args, Context, Query } from '@nestjs/graphql'
import { ContentService } from 'src/content/service'
import { ProvisionDto } from 'src/content/dto'
import { AuthGuard } from 'src/user/guard'

@Resolver()
export class ContentResolver {
  private readonly logger = new Logger(ContentResolver.name)

  constructor(private readonly contentService: ContentService) {}

  @UseGuards(AuthGuard)
  @Query(() => ProvisionDto)
  async provision(
    @Args('content_id') contentId: string,
    @Context('req') req,
  ): Promise<ProvisionDto> {
    const userId = req.user?.id
    const companyId = req.user?.company?.id

    if (!userId || !companyId) {
      throw new Error('User ID or Company ID is missing in the context')
    }

    this.logger.log(`Provisioning content=${contentId} to user=${userId} and company=${companyId}`)
    return this.contentService.provision(contentId, companyId)
  }
}
