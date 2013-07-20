//
//  AddSiteViewController.h
//  NewsBlur
//
//  Created by Samuel Clay on 10/04/2011.
//  Copyright 2011 NewsBlur. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "NewsBlurAppDelegate.h"
#import "ASIHTTPRequest.h"

@class NewsBlurAppDelegate;

@interface AddSiteViewController : UIViewController 
<UITextFieldDelegate, UIPickerViewDelegate, UIPickerViewDataSource, UITableViewDelegate, UITableViewDataSource, ASIHTTPRequestDelegate> {
    NewsBlurAppDelegate *appDelegate;
    
    UITextField *inFolderInput;
    UITextField *addFolderInput;
    UITextField *siteAddressInput;
    NSMutableData *jsonString;
    NSMutableArray *autocompleteResults;
    
    UIBarButtonItem *addButton;
    UIBarButtonItem *cancelButton;
    UIPickerView *folderPicker;
    UITableView *siteTable;
    UIScrollView *siteScrollView;
    UIButton *addFolderButton;
    
    UINavigationBar *navBar;
    UIActivityIndicatorView *activityIndicator;
    UIActivityIndicatorView *siteActivityIndicator;
    UILabel *addingLabel;
    UILabel *errorLabel;
}

- (void)reload;
- (IBAction)addSite;
- (void)autocompleteSite:(ASIHTTPRequest *)request;
- (IBAction)doCancelButton;
- (IBAction)doAddButton;
- (NSString *)extractParentFolder;
- (void)showFolderPicker;
- (void)hideFolderPicker;
- (IBAction)checkSiteAddress;
- (void)reloadSearchResults;
- (IBAction)toggleAddFolder:(id)sender;
- (NSArray *)folders;

@property (nonatomic) IBOutlet NewsBlurAppDelegate *appDelegate;
@property (nonatomic) IBOutlet UITextField *inFolderInput;
@property (nonatomic) IBOutlet UITextField *addFolderInput;
@property (nonatomic) IBOutlet UITextField *siteAddressInput;

@property (nonatomic) IBOutlet UIBarButtonItem *addButton;
@property (nonatomic) IBOutlet UIBarButtonItem *cancelButton;
@property (nonatomic) IBOutlet UIPickerView *folderPicker;
@property (nonatomic) IBOutlet UITableView *siteTable;
@property (nonatomic) IBOutlet UIScrollView *siteScrollView;
@property (nonatomic) IBOutlet UIButton *addFolderButton;
@property (nonatomic) NSMutableData * jsonString;
@property (nonatomic) NSMutableArray *autocompleteResults;

@property (nonatomic) IBOutlet UINavigationBar *navBar;
@property (nonatomic) IBOutlet UIActivityIndicatorView *activityIndicator;
@property (nonatomic) IBOutlet UIActivityIndicatorView *siteActivityIndicator;
@property (nonatomic) IBOutlet UILabel *addingLabel;
@property (nonatomic) IBOutlet UILabel *errorLabel;

@end
